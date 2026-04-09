
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  stripeCustomerId: 'stripeCustomerId',
  role: 'role',
  status: 'status',
  fullName: 'fullName',
  phone: 'phone',
  cpf: 'cpf',
  avatarPath: 'avatarPath',
  headline: 'headline',
  bio: 'bio',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  verificationStatus: 'verificationStatus',
  isVerified: 'isVerified',
  hashedRefreshToken: 'hashedRefreshToken',
  googleRefreshToken: 'googleRefreshToken',
  closeAtPeriodEnd: 'closeAtPeriodEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  documentPath: 'documentPath',
  specialties: 'specialties',
  publicSlug: 'publicSlug',
  averageRating: 'averageRating',
  totalReviews: 'totalReviews',
  totalLessons: 'totalLessons',
  publicBasePrice: 'publicBasePrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  educationLevel: 'educationLevel',
  schoolName: 'schoolName',
  studyGoal: 'studyGoal',
  futureInterests: 'futureInterests',
  notesAverage: 'notesAverage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherStudentLinkScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  studentId: 'studentId',
  createdAt: 'createdAt'
};

exports.Prisma.TeacherAvailabilityScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  weekday: 'weekday',
  startTime: 'startTime',
  endTime: 'endTime',
  timezone: 'timezone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  studentId: 'studentId',
  subject: 'subject',
  topic: 'topic',
  startAt: 'startAt',
  endAt: 'endAt',
  status: 'status',
  stripeCheckoutId: 'stripeCheckoutId',
  paymentStatus: 'paymentStatus',
  priceAmount: 'priceAmount',
  refundEligible: 'refundEligible',
  googleCalendarEventId: 'googleCalendarEventId',
  googleMeetUrl: 'googleMeetUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonRescheduleScalarFieldEnum = {
  id: 'id',
  lessonId: 'lessonId',
  requestedById: 'requestedById',
  oldStartAt: 'oldStartAt',
  oldEndAt: 'oldEndAt',
  newStartAt: 'newStartAt',
  newEndAt: 'newEndAt',
  status: 'status',
  reason: 'reason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  title: 'title',
  description: 'description',
  preview: 'preview',
  status: 'status',
  priceAmount: 'priceAmount',
  filePath: 'filePath',
  fileMimeType: 'fileMimeType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentPurchaseScalarFieldEnum = {
  id: 'id',
  contentId: 'contentId',
  studentId: 'studentId',
  stripeCheckoutId: 'stripeCheckoutId',
  paymentStatus: 'paymentStatus',
  paidAmount: 'paidAmount',
  snapshotTitle: 'snapshotTitle',
  snapshotPreview: 'snapshotPreview',
  snapshotFilePath: 'snapshotFilePath',
  createdAt: 'createdAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  studentId: 'studentId',
  lessonId: 'lessonId',
  title: 'title',
  description: 'description',
  dueAt: 'dueAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskQuestionScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  prompt: 'prompt',
  inputType: 'inputType',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt'
};

exports.Prisma.TaskSubmissionScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  studentId: 'studentId',
  submittedAt: 'submittedAt',
  score: 'score',
  feedback: 'feedback',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskAnswerScalarFieldEnum = {
  id: 'id',
  submissionId: 'submissionId',
  questionId: 'questionId',
  answerText: 'answerText',
  createdAt: 'createdAt'
};

exports.Prisma.SupportTicketScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  subject: 'subject',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupportMessageScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  senderId: 'senderId',
  body: 'body',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  paymentId: 'paymentId',
  documentPath: 'documentPath',
  selfieDocumentPath: 'selfieDocumentPath',
  status: 'status',
  rejectionReason: 'rejectionReason',
  resendDeadlineAt: 'resendDeadlineAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  tier: 'tier',
  status: 'status',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lessonId: 'lessonId',
  contentPurchaseId: 'contentPurchaseId',
  stripeCheckoutId: 'stripeCheckoutId',
  stripePaymentIntentId: 'stripePaymentIntentId',
  type: 'type',
  status: 'status',
  amount: 'amount',
  currency: 'currency',
  metadataJson: 'metadataJson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleToggleScalarFieldEnum = {
  id: 'id',
  key: 'key',
  label: 'label',
  enabled: 'enabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlatformSettingScalarFieldEnum = {
  id: 'id',
  platformName: 'platformName',
  officialEmail: 'officialEmail',
  logoPath: 'logoPath',
  iconPath: 'iconPath',
  primaryColor: 'primaryColor',
  legalDocument: 'legalDocument',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  payload: 'payload',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  PENDING_CLOSURE: 'PENDING_CLOSURE'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.LessonStatus = exports.$Enums.LessonStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  RESCHEDULE_PENDING: 'RESCHEDULE_PENDING'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELED: 'CANCELED'
};

exports.RescheduleStatus = exports.$Enums.RescheduleStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.ContentStatus = exports.$Enums.ContentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  DISABLED: 'DISABLED'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  ANSWERED: 'ANSWERED',
  CLOSED: 'CLOSED'
};

exports.PlanTier = exports.$Enums.PlanTier = {
  FREE: 'FREE',
  PRO: 'PRO'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
  INCOMPLETE: 'INCOMPLETE',
  TRIALING: 'TRIALING'
};

exports.PaymentType = exports.$Enums.PaymentType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  LESSON: 'LESSON',
  CONTENT: 'CONTENT',
  VERIFICATION: 'VERIFICATION'
};

exports.Prisma.ModelName = {
  User: 'User',
  TeacherProfile: 'TeacherProfile',
  StudentProfile: 'StudentProfile',
  TeacherStudentLink: 'TeacherStudentLink',
  TeacherAvailability: 'TeacherAvailability',
  Lesson: 'Lesson',
  LessonReschedule: 'LessonReschedule',
  Content: 'Content',
  ContentPurchase: 'ContentPurchase',
  Task: 'Task',
  TaskQuestion: 'TaskQuestion',
  TaskSubmission: 'TaskSubmission',
  TaskAnswer: 'TaskAnswer',
  SupportTicket: 'SupportTicket',
  SupportMessage: 'SupportMessage',
  VerificationRequest: 'VerificationRequest',
  Subscription: 'Subscription',
  Payment: 'Payment',
  ModuleToggle: 'ModuleToggle',
  PlatformSetting: 'PlatformSetting',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
