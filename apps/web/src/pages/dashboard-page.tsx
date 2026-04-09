import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { getAccessToken, setAccessToken } from '../lib/auth-store';
import { uploadFileToSignedUrl } from '../lib/storage-upload';
import { useSearchParams } from 'react-router-dom';

type DashboardPeriod = {
  startDate: string | null;
  endDate: string | null;
  label: string;
};

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  status: string;
  verificationStatus: string;
};

type ProfileDetails = UserProfile & {
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  headline?: string | null;
  teacherProfile?: {
    specialties: string[];
  } | null;
  studentProfile?: {
    studyGoal?: string | null;
  } | null;
};

type LessonItem = {
  id: string;
  subject: string;
  topic?: string | null;
  startAt: string;
  endAt: string;
  status: string;
  paymentStatus: string;
  googleMeetUrl?: string | null;
  meetJoinAvailable?: boolean;
  teacher?: { fullName: string };
  student?: { fullName: string };
  rescheduleRequests?: Array<{
    id: string;
    status: string;
    reason?: string | null;
    newStartAt: string;
    newEndAt: string;
    requestedById: string;
  }>;
};

type ContentItem = {
  id: string;
  title: string;
  preview: string;
  priceAmount: number | string;
  status?: string;
  teacher?: {
    fullName: string;
  };
};

type AdminDashboard = {
  totalTeachers: number;
  totalStudents: number;
  totalSubscriptions: number;
  blockedUsers: number;
  pendingVerifications: number;
  openTickets: number;
  period: DashboardPeriod;
  receitaBruta: number;
  repasseEstimado: number;
  receitaLiquida: number;
};

type RoleDashboard =
  | {
      role: 'TEACHER';
      period: DashboardPeriod;
      students: number;
      totalLessons: number;
      scheduledLessons: number;
      inProgressLessons: number;
      completedLessons: number;
      totalRecebimentos: number;
      publishedContents: number;
      tasks: number;
    }
  | {
      role: 'STUDENT';
      period: DashboardPeriod;
      completedLessons: number;
      scheduledLessons: number;
      canceledLessons: number;
      averageScore: number;
      libraryItems: number;
    }
  | {
      role: 'ADMIN';
      period: DashboardPeriod;
    };

type ModuleToggle = {
  id: string;
  label: string;
  enabled: boolean;
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  verificationStatus: string;
  subscriptions: Array<{
    tier: string;
    status: string;
    role: string;
  }>;
};

type PlatformSettings = {
  id: string;
  platformName: string;
  officialEmail?: string | null;
  primaryColor?: string | null;
  legalDocument?: string | null;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  owner?: {
    fullName: string;
    role: string;
  };
  messages: Array<{
    id: string;
    body: string;
    sender: {
      fullName: string;
      role: string;
    };
  }>;
};

type VerificationRequest = {
  id: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  user?: {
    fullName: string;
    role: string;
  };
};

type UploadUrlResponse = {
  path: string;
  token?: string;
  signedUrl: string;
};

type TaskItem = {
  id: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  questions?: Array<{
    id: string;
    prompt: string;
    inputType: string;
  }>;
  student?: { fullName: string };
  submissions: Array<{
    id: string;
    score?: number | null;
    feedback?: string | null;
    answers?: Array<{
      id: string;
      questionId?: string;
      answerText: string;
    }>;
  }>;
};

const roleDescriptions: Record<UserProfile['role'], string> = {
  ADMIN: 'Operação, métricas, tickets, verificações e módulos.',
  TEACHER: 'Alunos, agenda, conteúdos, aulas, pagamentos e reputação.',
  STUDENT: 'Busca, aulas, biblioteca, tarefas, histórico e desempenho.'
};

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);

  return { start, end };
}

function buildDashboardPeriodQuery(startDate: string, endDate: string) {
  const params = new URLSearchParams();

  if (startDate) {
    params.set('startDate', startDate);
  }

  if (endDate) {
    params.set('endDate', endDate);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function DashboardPage() {
  const token = getAccessToken();
  const [searchParams] = useSearchParams();
  const [dashboardStartDate, setDashboardStartDate] = useState(() => getCurrentMonthRange().start);
  const [dashboardEndDate, setDashboardEndDate] = useState(() => getCurrentMonthRange().end);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lessonTeacherId, setLessonTeacherId] = useState('');
  const [lessonSubject, setLessonSubject] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonStartAt, setLessonStartAt] = useState('');
  const [lessonEndAt, setLessonEndAt] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [taskStudentId, setTaskStudentId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentPreview, setContentPreview] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentPrice, setContentPrice] = useState('');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [verificationDocumentFile, setVerificationDocumentFile] = useState<File | null>(null);
  const [verificationSelfieFile, setVerificationSelfieFile] = useState<File | null>(null);
  const [verificationRejectionReason, setVerificationRejectionReason] = useState('');
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, string>>({});
  const [rescheduleReason, setRescheduleReason] = useState<Record<string, string>>({});
  const [rescheduleStartAt, setRescheduleStartAt] = useState<Record<string, string>>({});
  const [rescheduleEndAt, setRescheduleEndAt] = useState<Record<string, string>>({});
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
  const [taskScores, setTaskScores] = useState<Record<string, string>>({});
  const [taskFeedbacks, setTaskFeedbacks] = useState<Record<string, string>>({});
  const [platformName, setPlatformName] = useState('');
  const [platformEmail, setPlatformEmail] = useState('');
  const [platformColor, setPlatformColor] = useState('');
  const [platformLegalDocument, setPlatformLegalDocument] = useState('');

  const userQuery = useQuery({
    queryKey: ['me', token],
    queryFn: async () =>
      apiRequest<UserProfile>('/users/me', {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: async () =>
      apiRequest<ProfileDetails>('/profile/me', {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setHeadline(profileQuery.data.headline ?? '');
    setBio(profileQuery.data.bio ?? '');
    setCity(profileQuery.data.city ?? '');
    setState(profileQuery.data.state ?? '');
  }, [profileQuery.data]);

  useEffect(() => {
    const teacherId = searchParams.get('teacherId');

    if (teacherId) {
      setLessonTeacherId(teacherId);
    }
  }, [searchParams]);

  const profileMutation = useMutation({
    mutationFn: async () =>
      apiRequest('/profile/me', {
        method: 'PATCH',
        accessToken: token,
        body: JSON.stringify({ headline, bio, city, state })
      }),
    onSuccess: () => setStatusMessage('Perfil atualizado com sucesso.'),
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao salvar perfil.')
  });

  const checkoutMutation = useMutation({
    mutationFn: async (type: 'STUDENT_SUBSCRIPTION' | 'TEACHER_SUBSCRIPTION' | 'VERIFICATION') =>
      apiRequest<{ url: string }>('/billing/checkout', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({ type })
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao criar checkout.')
  });

  const portalMutation = useMutation({
    mutationFn: async () =>
      apiRequest<{ url: string }>('/billing/portal', {
        method: 'POST',
        accessToken: token
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao abrir portal.')
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', token],
    queryFn: async () =>
      apiRequest<LessonItem[]>('/lessons/me', {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  const publicContentsQuery = useQuery({
    queryKey: ['contents-public'],
    queryFn: async () => apiRequest<ContentItem[]>('/contents/public'),
    enabled: Boolean(token)
  });

  const myContentsQuery = useQuery({
    queryKey: ['contents-me', token],
    queryFn: async () =>
      apiRequest<ContentItem[]>('/contents/me', {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'TEACHER'
  });

  const libraryQuery = useQuery({
    queryKey: ['contents-library', token],
    queryFn: async () =>
      apiRequest<
        Array<{
          id: string;
          snapshotTitle: string;
          paidAmount: number | string;
          content: { teacher: { fullName: string } };
        }>
      >('/contents/library', {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'STUDENT'
  });

  const dashboardPeriodQuery = buildDashboardPeriodQuery(dashboardStartDate, dashboardEndDate);

  const adminDashboardQuery = useQuery({
    queryKey: ['admin-dashboard', token, dashboardStartDate, dashboardEndDate],
    queryFn: async () =>
      apiRequest<AdminDashboard>(`/admin/dashboard${dashboardPeriodQuery}`, {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'ADMIN'
  });

  const roleDashboardQuery = useQuery({
    queryKey: ['role-dashboard', token, dashboardStartDate, dashboardEndDate],
    queryFn: async () =>
      apiRequest<RoleDashboard>(`/profile/me/dashboard${dashboardPeriodQuery}`, {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  const adminFinanceQuery = useQuery({
    queryKey: ['admin-finance', token, dashboardStartDate, dashboardEndDate],
    queryFn: async () =>
      apiRequest<{
        period: DashboardPeriod;
        total: number;
        subscriptions: number;
        lessons: number;
        contents: number;
        verifications: number;
      }>(`/admin/finance${dashboardPeriodQuery}`, {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'ADMIN'
  });

  const adminUsersQuery = useQuery({
    queryKey: ['admin-users', token],
    queryFn: async () =>
      apiRequest<AdminUser[]>('/admin/users', {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'ADMIN'
  });

  const adminSettingsQuery = useQuery({
    queryKey: ['admin-settings', token],
    queryFn: async () =>
      apiRequest<PlatformSettings>('/admin/settings', {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'ADMIN'
  });

  const moduleTogglesQuery = useQuery({
    queryKey: ['admin-modules', token],
    queryFn: async () =>
      apiRequest<ModuleToggle[]>('/admin/modules', {
        accessToken: token
      }),
    enabled: Boolean(token) && userQuery.data?.role === 'ADMIN'
  });

  const supportTicketsQuery = useQuery({
    queryKey: ['support-tickets', token],
    queryFn: async () =>
      apiRequest<SupportTicket[]>('/support/tickets', {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  const verificationRequestsQuery = useQuery({
    queryKey: ['verifications', token, userQuery.data?.role],
    queryFn: async () =>
      apiRequest<VerificationRequest[]>(
        userQuery.data?.role === 'ADMIN' ? '/verifications/admin' : '/verifications/me',
        {
          accessToken: token
        }
      ),
    enabled: Boolean(token)
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', token],
    queryFn: async () =>
      apiRequest<TaskItem[]>('/tasks/me', {
        accessToken: token
      }),
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (!adminSettingsQuery.data) {
      return;
    }

    setPlatformName(adminSettingsQuery.data.platformName ?? '');
    setPlatformEmail(adminSettingsQuery.data.officialEmail ?? '');
    setPlatformColor(adminSettingsQuery.data.primaryColor ?? '');
    setPlatformLegalDocument(adminSettingsQuery.data.legalDocument ?? '');
  }, [adminSettingsQuery.data]);

  const contentCheckoutMutation = useMutation({
    mutationFn: async (contentId: string) =>
      apiRequest<{ url: string }>(`/contents/${contentId}/checkout`, {
        method: 'POST',
        accessToken: token
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao iniciar compra do conteúdo.')
  });

  const lessonCheckoutMutation = useMutation({
    mutationFn: async () =>
      apiRequest<{ url: string }>('/lessons/checkout', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          teacherId: lessonTeacherId,
          subject: lessonSubject,
          topic: lessonTopic,
          startAt: lessonStartAt,
          endAt: lessonEndAt
        })
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao iniciar checkout da aula.')
  });

  const createTicketMutation = useMutation({
    mutationFn: async () =>
      apiRequest('/support/tickets', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDescription
        })
      }),
    onSuccess: () => {
      setTicketSubject('');
      setTicketDescription('');
      setStatusMessage('Chamado criado com sucesso.');
      supportTicketsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao criar ticket.')
  });

  const createTaskMutation = useMutation({
    mutationFn: async () =>
      apiRequest('/tasks', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          studentId: taskStudentId,
          title: taskTitle,
          description: taskDescription,
          questions: [
            {
              prompt: 'Descreva sua resposta.',
              inputType: 'TEXTAREA',
              sortOrder: 1
            }
          ]
        })
      }),
    onSuccess: () => {
      setTaskStudentId('');
      setTaskTitle('');
      setTaskDescription('');
      setStatusMessage('Tarefa criada com sucesso.');
      tasksQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao criar tarefa.')
  });

  const cancelLessonMutation = useMutation({
    mutationFn: async (lessonId: string) =>
      apiRequest(`/lessons/${lessonId}/cancel`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({})
      }),
    onSuccess: () => {
      setStatusMessage('Aula cancelada.');
      lessonsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao cancelar aula.')
  });

  const createContentMutation = useMutation({
    mutationFn: async () => {
      if (!contentFile) {
        throw new Error('Selecione um arquivo para o conteúdo.');
      }

      const upload = await apiRequest<UploadUrlResponse>('/contents/upload-url', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          fileName: contentFile.name,
          mimeType: contentFile.type || 'application/octet-stream'
        })
      });

      await uploadFileToSignedUrl(upload.signedUrl, contentFile, upload.token);

      return apiRequest('/contents', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          title: contentTitle,
          preview: contentPreview,
          description: contentDescription,
          priceAmount: Number(contentPrice),
          filePath: upload.path,
          fileMimeType: contentFile.type || 'application/octet-stream'
        })
      });
    },
    onSuccess: () => {
      setContentTitle('');
      setContentPreview('');
      setContentDescription('');
      setContentPrice('');
      setContentFile(null);
      setStatusMessage('Conteúdo publicado com sucesso.');
      myContentsQuery.refetch();
      publicContentsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao publicar conteúdo.')
  });

  const createVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!verificationDocumentFile || !verificationSelfieFile) {
        throw new Error('Envie documento e selfie para verificar a conta.');
      }

      const [documentUpload, selfieUpload] = await Promise.all([
        apiRequest<UploadUrlResponse>('/verifications/upload-url/document', {
          method: 'POST',
          accessToken: token,
          body: JSON.stringify({
            fileName: verificationDocumentFile.name
          })
        }),
        apiRequest<UploadUrlResponse>('/verifications/upload-url/selfie', {
          method: 'POST',
          accessToken: token,
          body: JSON.stringify({
            fileName: verificationSelfieFile.name
          })
        })
      ]);

      await Promise.all([
        uploadFileToSignedUrl(documentUpload.signedUrl, verificationDocumentFile, documentUpload.token),
        uploadFileToSignedUrl(selfieUpload.signedUrl, verificationSelfieFile, selfieUpload.token)
      ]);

      return apiRequest('/verifications', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          documentPath: documentUpload.path,
          selfieDocumentPath: selfieUpload.path
        })
      });
    },
    onSuccess: () => {
      setVerificationDocumentFile(null);
      setVerificationSelfieFile(null);
      setStatusMessage('Solicitação de verificação enviada.');
      verificationRequestsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao enviar verificação.')
  });

  const approveVerificationMutation = useMutation({
    mutationFn: async (requestId: string) =>
      apiRequest(`/verifications/admin/${requestId}/approve`, {
        method: 'POST',
        accessToken: token
      }),
    onSuccess: () => {
      setStatusMessage('Verificação aprovada.');
      verificationRequestsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao aprovar verificação.')
  });

  const rejectVerificationMutation = useMutation({
    mutationFn: async (requestId: string) =>
      apiRequest(`/verifications/admin/${requestId}/reject`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          rejectionReason: verificationRejectionReason
        })
      }),
    onSuccess: () => {
      setVerificationRejectionReason('');
      setStatusMessage('Verificação reprovada.');
      verificationRequestsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao reprovar verificação.')
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({ toggleId, enabled }: { toggleId: string; enabled: boolean }) =>
      apiRequest(`/admin/modules/${toggleId}`, {
        method: 'PATCH',
        accessToken: token,
        body: JSON.stringify({ enabled })
      }),
    onSuccess: () => {
      setStatusMessage('Módulo atualizado.');
      moduleTogglesQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao atualizar módulo.')
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'ACTIVE' | 'BLOCKED' }) =>
      apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        accessToken: token,
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      setStatusMessage('Status do usuário atualizado.');
      adminUsersQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao atualizar status do usuário.')
  });

  const updatePlatformSettingsMutation = useMutation({
    mutationFn: async () =>
      apiRequest('/admin/settings', {
        method: 'PATCH',
        accessToken: token,
        body: JSON.stringify({
          platformName,
          officialEmail: platformEmail,
          primaryColor: platformColor,
          legalDocument: platformLegalDocument
        })
      }),
    onSuccess: () => {
      setStatusMessage('Configurações institucionais atualizadas.');
      adminSettingsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao atualizar configurações.')
  });

  const downloadLibraryItemMutation = useMutation({
    mutationFn: async (purchaseId: string) =>
      apiRequest<{ url: string }>(`/contents/library/${purchaseId}/download`, {
        accessToken: token
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao abrir download.')
  });

  const replyTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      body,
      status
    }: {
      ticketId: string;
      body: string;
      status?: string;
    }) =>
      apiRequest(`/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({ body, status })
      }),
    onSuccess: (_, variables) => {
      setTicketReplies((current) => ({ ...current, [variables.ticketId]: '' }));
      setStatusMessage('Resposta enviada.');
      supportTicketsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao responder ticket.')
  });

  const requestRescheduleMutation = useMutation({
    mutationFn: async (lessonId: string) =>
      apiRequest(`/lessons/${lessonId}/reschedule`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          newStartAt: rescheduleStartAt[lessonId],
          newEndAt: rescheduleEndAt[lessonId],
          reason: rescheduleReason[lessonId]
        })
      }),
    onSuccess: (_, lessonId) => {
      setStatusMessage('Solicitação de reagendamento enviada.');
      lessonsQuery.refetch();
      setRescheduleReason((current) => ({ ...current, [lessonId]: '' }));
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao solicitar reagendamento.')
  });

  const respondRescheduleMutation = useMutation({
    mutationFn: async ({
      requestId,
      approve
    }: {
      requestId: string;
      approve: boolean;
    }) =>
      apiRequest(`/lessons/reschedules/${requestId}/respond`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({ approve })
      }),
    onSuccess: () => {
      setStatusMessage('Reagendamento respondido.');
      lessonsQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao responder reagendamento.')
  });

  const verificationFileMutation = useMutation({
    mutationFn: async ({
      requestId,
      kind
    }: {
      requestId: string;
      kind: 'document' | 'selfie';
    }) =>
      apiRequest<{ url: string }>(`/verifications/admin/${requestId}/file/${kind}`, {
        accessToken: token
      }),
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao abrir arquivo.')
  });

  const submitTaskMutation = useMutation({
    mutationFn: async (task: TaskItem) =>
      apiRequest(`/tasks/${task.id}/submit`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          answers:
            task.questions?.map((question) => ({
              questionId: question.id,
              answerText: taskAnswers[`${task.id}:${question.id}`] ?? ''
            })) ?? []
        })
      }),
    onSuccess: () => {
      setStatusMessage('Tarefa enviada com sucesso.');
      tasksQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao enviar tarefa.')
  });

  const gradeTaskMutation = useMutation({
    mutationFn: async (taskId: string) =>
      apiRequest(`/tasks/${taskId}/grade`, {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          score: Number(taskScores[taskId] ?? 0),
          feedback: taskFeedbacks[taskId] ?? ''
        })
      }),
    onSuccess: () => {
      setStatusMessage('Tarefa corrigida com sucesso.');
      tasksQuery.refetch();
    },
    onError: (error) =>
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao corrigir tarefa.')
  });

  if (!token) {
    return (
      <section className="container-shell py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Acesso necessário</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Faça login para abrir o painel interno com dados reais do seu perfil.
          </p>
        </div>
      </section>
    );
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    profileMutation.mutate();
  }

  function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    lessonCheckoutMutation.mutate();
  }

  function handleTicketSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    createTicketMutation.mutate();
  }

  function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    createTaskMutation.mutate();
  }

  function handleContentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    createContentMutation.mutate();
  }

  function handleVerificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    createVerificationMutation.mutate();
  }

  const billingType =
    userQuery.data?.role === 'TEACHER' ? 'TEACHER_SUBSCRIPTION' : 'STUDENT_SUBSCRIPTION';

  return (
    <section className="container-shell py-12">
      <div className="grid gap-6 xl:grid-cols-[0.28fr_0.72fr]">
        <aside className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Painel interno</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {userQuery.data?.fullName ?? 'Carregando...'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {userQuery.data ? roleDescriptions[userQuery.data.role] : 'Consultando API e permissões.'}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                if (token) {
                  await apiRequest('/auth/logout', {
                    method: 'POST',
                    accessToken: token
                  });
                }
              } finally {
                setAccessToken(null);
                window.location.href = '/auth';
              }
            }}
            className="mt-8 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Limpar sessão local
          </button>
          <button
            type="button"
            onClick={() => checkoutMutation.mutate(billingType)}
            className="mt-3 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Assinar plano
          </button>
          <button
            type="button"
            onClick={() => checkoutMutation.mutate('VERIFICATION')}
            className="mt-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Solicitar verificação
          </button>
          <button
            type="button"
            onClick={() => portalMutation.mutate()}
            className="mt-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Portal da assinatura
          </button>
        </aside>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Status da API</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {userQuery.isLoading ? 'Carregando...' : userQuery.isError ? 'Erro' : 'Conectado'}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              O painel já consome a rota autenticada `/users/me` do backend NestJS com JWT.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Papel atual</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {userQuery.data?.role ?? 'Sem sessão'}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Guards por papel e expansão dos módulos operacionais entram a partir desta base.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Próxima camada de implementação</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li>Admin: métricas, tickets, financeiro, verificações e feature flags.</li>
              <li>Professor: agenda, conteúdos, tarefas, aulas e perfil público.</li>
              <li>Aluno: busca, checkout de aulas, biblioteca e histórico.</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Filtro de período</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Os cards abaixo recalculam o desempenho e o financeiro com base neste intervalo real.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Data inicial</span>
                  <input
                    type="date"
                    value={dashboardStartDate}
                    onChange={(event) => setDashboardStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Data final</span>
                  <input
                    type="date"
                    value={dashboardEndDate}
                    onChange={(event) => setDashboardEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const range = getCurrentMonthRange();
                    setDashboardStartDate(range.start);
                    setDashboardEndDate(range.end);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Mês atual
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {roleDashboardQuery.data?.period.label ?? adminDashboardQuery.data?.period.label ?? 'Todo o período'}
            </div>
          </div>
          {roleDashboardQuery.data?.role === 'TEACHER' ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <p className="text-sm font-medium text-slate-500">Dashboard do professor</p>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Alunos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.students}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Aulas agendadas</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.scheduledLessons}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Recebimentos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    R$ {roleDashboardQuery.data.totalRecebimentos.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Conteúdos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.publishedContents}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <p className="text-sm font-medium text-slate-500">Configurações institucionais</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updatePlatformSettingsMutation.mutate();
                  }}
                  className="mt-4 grid gap-4 md:grid-cols-2"
                >
                  <input
                    value={platformName}
                    onChange={(event) => setPlatformName(event.target.value)}
                    placeholder="Nome da plataforma"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformEmail}
                    onChange={(event) => setPlatformEmail(event.target.value)}
                    placeholder="E-mail oficial"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformColor}
                    onChange={(event) => setPlatformColor(event.target.value)}
                    placeholder="Cor principal"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformLegalDocument}
                    onChange={(event) => setPlatformLegalDocument(event.target.value)}
                    placeholder="CNPJ/CPF"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      {updatePlatformSettingsMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
          {roleDashboardQuery.data?.role === 'STUDENT' ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <p className="text-sm font-medium text-slate-500">Dashboard do aluno</p>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Aulas concluídas</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.completedLessons}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Aulas agendadas</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.scheduledLessons}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Média</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.averageScore.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Biblioteca</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{roleDashboardQuery.data.libraryItems}</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Perfil operacional</p>
            <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Headline</span>
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Cidade</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Estado</span>
                <input
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Biografia</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {profileMutation.isPending ? 'Salvando...' : 'Salvar perfil'}
                </button>
                {statusMessage ? <p className="text-sm text-slate-600">{statusMessage}</p> : null}
              </div>
            </form>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Aulas</p>
            {userQuery.data?.role === 'STUDENT' ? (
              <form onSubmit={handleLessonSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">ID do professor</span>
                  <input
                    value={lessonTeacherId}
                    onChange={(event) => setLessonTeacherId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Matéria</span>
                  <input
                    value={lessonSubject}
                    onChange={(event) => setLessonSubject(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Assunto</span>
                  <input
                    value={lessonTopic}
                    onChange={(event) => setLessonTopic(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Início</span>
                  <input
                    type="datetime-local"
                    value={lessonStartAt}
                    onChange={(event) => setLessonStartAt(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Fim</span>
                  <input
                    type="datetime-local"
                    value={lessonEndAt}
                    onChange={(event) => setLessonEndAt(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {lessonCheckoutMutation.isPending ? 'Redirecionando...' : 'Agendar aula com checkout'}
                  </button>
                </div>
              </form>
            ) : null}
            <div className="mt-6 space-y-3">
              {lessonsQuery.data?.map((lesson) => (
                <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{lesson.subject}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(lesson.startAt).toLocaleString('pt-BR')} • {lesson.status} • {lesson.paymentStatus}
                  </p>
                  {lesson.googleMeetUrl ? (
                    <a
                      href={lesson.googleMeetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-blue-700"
                    >
                      Abrir Google Meet
                    </a>
                  ) : lesson.status === 'SCHEDULED' || lesson.status === 'IN_PROGRESS' ? (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {lesson.meetJoinAvailable
                        ? 'Link da aula ainda está sincronizando.'
                        : 'O link do Google Meet será liberado 5 minutos antes da aula.'}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelLessonMutation.mutate(lesson.id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancelar aula
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <input
                      type="datetime-local"
                      value={rescheduleStartAt[lesson.id] ?? ''}
                      onChange={(event) =>
                        setRescheduleStartAt((current) => ({
                          ...current,
                          [lesson.id]: event.target.value
                        }))
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                    <input
                      type="datetime-local"
                      value={rescheduleEndAt[lesson.id] ?? ''}
                      onChange={(event) =>
                        setRescheduleEndAt((current) => ({
                          ...current,
                          [lesson.id]: event.target.value
                        }))
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                    <input
                      value={rescheduleReason[lesson.id] ?? ''}
                      onChange={(event) =>
                        setRescheduleReason((current) => ({
                          ...current,
                          [lesson.id]: event.target.value
                        }))
                      }
                      placeholder="Motivo do reagendamento"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => requestRescheduleMutation.mutate(lesson.id)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Solicitar reagendamento
                    </button>
                  </div>
                  {lesson.rescheduleRequests?.length ? (
                    <div className="mt-4 space-y-2">
                      {lesson.rescheduleRequests.map((request) => (
                        <div key={request.id} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-900">
                            {request.status} • {new Date(request.newStartAt).toLocaleString('pt-BR')}
                          </p>
                          {request.reason ? (
                            <p className="mt-1 text-xs text-slate-600">{request.reason}</p>
                          ) : null}
                          {request.status === 'PENDING' ? (
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  respondRescheduleMutation.mutate({
                                    requestId: request.id,
                                    approve: true
                                  })
                                }
                                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                              >
                                Aprovar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  respondRescheduleMutation.mutate({
                                    requestId: request.id,
                                    approve: false
                                  })
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                Reprovar
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {!lessonsQuery.data?.length ? (
                <p className="text-sm text-slate-500">Nenhuma aula registrada ainda.</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Conteúdos</p>
            {userQuery.data?.role === 'TEACHER' ? (
              <>
                <form onSubmit={handleContentSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Título</span>
                    <input
                      value={contentTitle}
                      onChange={(event) => setContentTitle(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Preço</span>
                    <input
                      value={contentPrice}
                      onChange={(event) => setContentPrice(event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Prévia</span>
                    <input
                      value={contentPreview}
                      onChange={(event) => setContentPreview(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Descrição</span>
                    <textarea
                      value={contentDescription}
                      onChange={(event) => setContentDescription(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Arquivo</span>
                    <input
                      type="file"
                      onChange={(event) => setContentFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {createContentMutation.isPending ? 'Publicando...' : 'Publicar conteúdo'}
                    </button>
                  </div>
                </form>
                <div className="mt-6 space-y-3">
                  {myContentsQuery.data?.map((content) => (
                    <div key={content.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{content.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {content.status} • R$ {Number(content.priceAmount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {!myContentsQuery.data?.length ? (
                    <p className="text-sm text-slate-500">Nenhum conteúdo publicado ainda.</p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="mt-5 grid gap-4">
                {publicContentsQuery.data?.map((content) => (
                  <div key={content.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{content.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{content.preview}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-blue-700">
                        R$ {Number(content.priceAmount).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => contentCheckoutMutation.mutate(content.id)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Comprar conteúdo
                      </button>
                    </div>
                  </div>
                ))}
                {!publicContentsQuery.data?.length ? (
                  <p className="text-sm text-slate-500">Nenhum conteúdo publicado ainda.</p>
                ) : null}
              </div>
            )}
            {userQuery.data?.role === 'STUDENT' ? (
              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500">Minha biblioteca</p>
                <div className="mt-4 space-y-3">
                  {libraryQuery.data?.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{item.snapshotTitle}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.content.teacher.fullName} • R$ {Number(item.paidAmount).toFixed(2)}
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => downloadLibraryItemMutation.mutate(item.id)}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Baixar material
                        </button>
                      </div>
                    </div>
                  ))}
                  {!libraryQuery.data?.length ? (
                    <p className="text-sm text-slate-500">Sua biblioteca ainda está vazia.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Tarefas</p>
            {userQuery.data?.role === 'TEACHER' ? (
              <form onSubmit={handleTaskSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">ID do aluno</span>
                  <input
                    value={taskStudentId}
                    onChange={(event) => setTaskStudentId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Título</span>
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Descrição</span>
                  <textarea
                    value={taskDescription}
                    onChange={(event) => setTaskDescription(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {createTaskMutation.isPending ? 'Criando...' : 'Criar tarefa'}
                  </button>
                </div>
              </form>
            ) : null}
            <div className="mt-6 space-y-3">
              {tasksQuery.data?.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {task.student?.fullName ?? 'Minha tarefa'} •{' '}
                    {task.submissions[0]?.score != null ? `Nota ${task.submissions[0].score}` : 'Sem nota'}
                  </p>
                  {task.description ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
                  ) : null}
                  {userQuery.data?.role === 'STUDENT' ? (
                    <div className="mt-4 space-y-3">
                      {task.questions?.map((question) => (
                        <div key={question.id}>
                          <p className="mb-2 text-sm font-medium text-slate-700">{question.prompt}</p>
                          <textarea
                            value={taskAnswers[`${task.id}:${question.id}`] ?? ''}
                            onChange={(event) =>
                              setTaskAnswers((current) => ({
                                ...current,
                                [`${task.id}:${question.id}`]: event.target.value
                              }))
                            }
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => submitTaskMutation.mutate(task)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Enviar tarefa
                      </button>
                    </div>
                  ) : null}
                  {userQuery.data?.role === 'TEACHER' ? (
                    <div className="mt-4 space-y-3">
                      {task.submissions[0]?.answers?.map((answer) => (
                        <div key={answer.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p>{answer.answerText}</p>
                        </div>
                      ))}
                      <div className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={taskScores[task.id] ?? ''}
                          onChange={(event) =>
                            setTaskScores((current) => ({
                              ...current,
                              [task.id]: event.target.value
                            }))
                          }
                          placeholder="Nota"
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                        />
                        <input
                          value={taskFeedbacks[task.id] ?? ''}
                          onChange={(event) =>
                            setTaskFeedbacks((current) => ({
                              ...current,
                              [task.id]: event.target.value
                            }))
                          }
                          placeholder="Feedback"
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => gradeTaskMutation.mutate(task.id)}
                          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Corrigir
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              {!tasksQuery.data?.length ? (
                <p className="text-sm text-slate-500">Nenhuma tarefa registrada ainda.</p>
              ) : null}
            </div>
          </div>
          {userQuery.data?.role === 'ADMIN' ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <p className="text-sm font-medium text-slate-500">Operação administrativa</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Professores</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {adminDashboardQuery.data?.totalTeachers ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Alunos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {adminDashboardQuery.data?.totalStudents ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Receita bruta</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    R$ {Number(adminDashboardQuery.data?.receitaBruta ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Assinaturas</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    R$ {Number(adminFinanceQuery.data?.subscriptions ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Aulas</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    R$ {Number(adminFinanceQuery.data?.lessons ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Conteúdos</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    R$ {Number(adminFinanceQuery.data?.contents ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Verificações</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    R$ {Number(adminFinanceQuery.data?.verifications ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Usuários bloqueados</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {adminDashboardQuery.data?.blockedUsers ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Verificações pendentes</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {adminDashboardQuery.data?.pendingVerifications ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Tickets abertos</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {adminDashboardQuery.data?.openTickets ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-500">Configurações institucionais</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updatePlatformSettingsMutation.mutate();
                  }}
                  className="mt-4 grid gap-4 md:grid-cols-2"
                >
                  <input
                    value={platformName}
                    onChange={(event) => setPlatformName(event.target.value)}
                    placeholder="Nome da plataforma"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformEmail}
                    onChange={(event) => setPlatformEmail(event.target.value)}
                    placeholder="E-mail oficial"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformColor}
                    onChange={(event) => setPlatformColor(event.target.value)}
                    placeholder="Cor principal"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <input
                    value={platformLegalDocument}
                    onChange={(event) => setPlatformLegalDocument(event.target.value)}
                    placeholder="CNPJ/CPF"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      {updatePlatformSettingsMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="mt-6 space-y-3">
                {moduleTogglesQuery.data?.map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{toggle.label}</p>
                      <p className="text-sm text-slate-500">{toggle.enabled ? 'Ativo' : 'Desativado'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toggleModuleMutation.mutate({
                          toggleId: toggle.id,
                          enabled: !toggle.enabled
                        })
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {toggle.enabled ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500">Usuários</p>
                <div className="mt-4 space-y-3">
                  {adminUsersQuery.data?.map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{userItem.fullName}</p>
                        <p className="text-sm text-slate-500">
                          {userItem.email} • {userItem.role} • {userItem.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateUserStatusMutation.mutate({
                            userId: userItem.id,
                            status: userItem.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
                          })
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {userItem.status === 'BLOCKED' ? 'Ativar' : 'Bloquear'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Suporte</p>
            <form onSubmit={handleTicketSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Assunto</span>
                <input
                  value={ticketSubject}
                  onChange={(event) => setTicketSubject(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  required
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Descrição</span>
                <textarea
                  value={ticketDescription}
                  onChange={(event) => setTicketDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  required
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {createTicketMutation.isPending ? 'Enviando...' : 'Abrir chamado'}
                </button>
              </div>
            </form>
            <div className="mt-6 space-y-3">
              {supportTicketsQuery.data?.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <p className="mt-1 text-sm text-slate-500">{ticket.status}</p>
                  <div className="mt-3 space-y-2">
                    {ticket.messages.map((message) => (
                      <div key={message.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-medium text-slate-900">{message.sender.fullName}</p>
                        <p className="mt-1">{message.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    {userQuery.data?.role === 'ADMIN' ? (
                      <select
                        value={ticketStatuses[ticket.id] ?? ticket.status}
                        onChange={(event) =>
                          setTicketStatuses((current) => ({
                            ...current,
                            [ticket.id]: event.target.value
                          }))
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="ANSWERED">ANSWERED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    ) : null}
                    <input
                      value={ticketReplies[ticket.id] ?? ''}
                      onChange={(event) =>
                        setTicketReplies((current) => ({
                          ...current,
                          [ticket.id]: event.target.value
                        }))
                      }
                      placeholder="Responder ticket"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        replyTicketMutation.mutate({
                          ticketId: ticket.id,
                          body: ticketReplies[ticket.id] ?? '',
                          status: userQuery.data?.role === 'ADMIN' ? ticketStatuses[ticket.id] ?? ticket.status : undefined
                        })
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
              {!supportTicketsQuery.data?.length ? (
                <p className="text-sm text-slate-500">Nenhum ticket aberto ainda.</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-slate-500">Verificações</p>
            {userQuery.data?.role !== 'ADMIN' ? (
              <form onSubmit={handleVerificationSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Documento</span>
                  <input
                    type="file"
                    onChange={(event) => setVerificationDocumentFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Selfie com documento</span>
                  <input
                    type="file"
                    onChange={(event) => setVerificationSelfieFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {createVerificationMutation.isPending ? 'Enviando...' : 'Enviar verificação'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5">
                <label className="block max-w-xl">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Motivo padrão para reprovação</span>
                  <input
                    value={verificationRejectionReason}
                    onChange={(event) => setVerificationRejectionReason(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Informe o motivo ao reprovar"
                  />
                </label>
              </div>
            )}
            <div className="mt-5 space-y-3">
              {verificationRequestsQuery.data?.map((request) => (
                <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {request.user ? `${request.user.fullName} • ${request.user.role}` : 'Minha solicitação'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.status} • {new Date(request.createdAt).toLocaleString('pt-BR')}
                  </p>
                  {request.rejectionReason ? (
                    <p className="mt-2 text-sm text-rose-600">{request.rejectionReason}</p>
                  ) : null}
                  {userQuery.data?.role === 'ADMIN' ? (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          verificationFileMutation.mutate({
                            requestId: request.id,
                            kind: 'document'
                          })
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver documento
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          verificationFileMutation.mutate({
                            requestId: request.id,
                            kind: 'selfie'
                          })
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver selfie
                      </button>
                      <button
                        type="button"
                        onClick={() => approveVerificationMutation.mutate(request.id)}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectVerificationMutation.mutate(request.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Reprovar
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {!verificationRequestsQuery.data?.length ? (
                <p className="text-sm text-slate-500">Nenhuma solicitação de verificação registrada.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
