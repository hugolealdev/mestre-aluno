import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { GradeTaskDto } from './dto/grade-task.dto.js';
import { SubmitTaskDto } from './dto/submit-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, role: Role) {
    return this.prisma.task.findMany({
      where:
        role === Role.TEACHER
          ? { teacherId: userId }
          : role === Role.STUDENT
            ? { studentId: userId }
            : undefined,
      include: {
        questions: true,
        lesson: {
          select: {
            id: true,
            subject: true,
            startAt: true,
            endAt: true
          }
        },
        student: {
          select: {
            id: true,
            fullName: true
          }
        },
        submissions: {
          include: {
            answers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(teacherId: string, role: Role, dto: CreateTaskDto) {
    if (role !== Role.TEACHER) {
      throw new ForbiddenException('Apenas professores podem criar tarefas.');
    }

    const relation = await this.prisma.teacherStudentLink.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId: dto.studentId
        }
      }
    });

    if (!relation) {
      throw new BadRequestException('Aluno ainda não está vinculado a este professor.');
    }

    return this.prisma.task.create({
      data: {
        teacherId,
        studentId: dto.studentId,
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        questions: {
          create: dto.questions.map((question) => ({
            prompt: question.prompt,
            inputType: question.inputType,
            sortOrder: question.sortOrder
          }))
        },
        submissions: {
          create: {
            studentId: dto.studentId
          }
        }
      },
      include: {
        questions: true,
        submissions: true
      }
    });
  }

  async submit(studentId: string, role: Role, taskId: string, dto: SubmitTaskDto) {
    if (role !== Role.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem responder tarefas.');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        submissions: true,
        questions: true
      }
    });

    if (!task || task.studentId !== studentId) {
      throw new NotFoundException('Tarefa não encontrada para este aluno.');
    }

    const submission = task.submissions[0];

    if (!submission) {
      throw new NotFoundException('Submissão da tarefa não encontrada.');
    }

    await this.prisma.taskAnswer.deleteMany({
      where: { submissionId: submission.id }
    });

    return this.prisma.taskSubmission.update({
      where: { id: submission.id },
      data: {
        submittedAt: new Date(),
        answers: {
          create: dto.answers.map((answer) => ({
            questionId: answer.questionId,
            answerText: answer.answerText
          }))
        }
      },
      include: {
        answers: true
      }
    });
  }

  async grade(teacherId: string, role: Role, taskId: string, dto: GradeTaskDto) {
    if (role !== Role.TEACHER) {
      throw new ForbiddenException('Apenas professores podem corrigir tarefas.');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        submissions: true
      }
    });

    if (!task || task.teacherId !== teacherId) {
      throw new NotFoundException('Tarefa não encontrada para este professor.');
    }

    const submission = task.submissions[0];

    if (!submission) {
      throw new NotFoundException('Submissão não encontrada.');
    }

    const updatedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submission.id },
      data: {
        score: dto.score,
        feedback: dto.feedback
      }
    });

    const stats = await this.prisma.taskSubmission.aggregate({
      where: {
        studentId: task.studentId,
        task: {
          teacherId
        },
        score: {
          not: null
        }
      },
      _avg: {
        score: true
      }
    });

    await this.prisma.studentProfile.updateMany({
      where: { userId: task.studentId },
      data: {
        notesAverage: stats._avg.score ?? 0
      }
    });

    return updatedSubmission;
  }
}

