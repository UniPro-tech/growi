import {
  Types, Document, PaginateModel, Schema, /* , Query */
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import ActivityDefine from '../util/activityDefine';
import { ActivityDocument } from './activity';
import { getOrCreateModel } from '../util/mongoose-utils';
import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:models:inAppNotification');

export const STATUS_UNREAD = 'UNREAD';
export const STATUS_UNOPENED = 'UNOPENED';
export const STATUS_OPENED = 'OPENED';
const STATUSES = [STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED];

export interface InAppNotificationDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  action: string
  activities: ActivityDocument[]
  status: string
  createdAt: Date
}


export interface InAppNotificationModel extends PaginateModel<InAppNotificationDocument> {
  // static paginate: PaginateMethod<PaginatedModel>;
  findLatestInAppNotificationsByUser(user: Types.ObjectId, skip: number, offset: number)
  getUnreadCountByUser(user: Types.ObjectId): Promise<number | undefined>
  open(user, id: Types.ObjectId): Promise<InAppNotificationDocument | null>
  read(user) /* : Promise<Query<any>> */

  STATUS_UNREAD: string
  STATUS_UNOPENED: string
  STATUS_OPENED: string
}

const inAppNotificationSchema = new Schema<InAppNotificationDocument, InAppNotificationModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    require: true,
  },
  targetModel: {
    type: String,
    require: true,
    enum: ActivityDefine.getSupportTargetModelNames(),
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel',
    require: true,
  },
  action: {
    type: String,
    require: true,
    enum: ActivityDefine.getSupportActionNames(),
  },
  activities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
    },
  ],
  status: {
    type: String,
    default: STATUS_UNREAD,
    enum: STATUSES,
    index: true,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
inAppNotificationSchema.plugin(mongoosePaginate);

const transform = (doc, ret) => {
  // delete ret.activities
};
inAppNotificationSchema.set('toObject', { virtuals: true, transform });
inAppNotificationSchema.set('toJSON', { virtuals: true, transform });
inAppNotificationSchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
});

inAppNotificationSchema.statics.STATUS_UNOPENED = function() {
  return STATUS_UNOPENED;
};
inAppNotificationSchema.statics.STATUS_UNREAD = function() {
  return STATUS_UNREAD;
};
inAppNotificationSchema.statics.STATUS_OPENED = function() {
  return STATUS_OPENED;
};

const InAppNotification = getOrCreateModel<InAppNotificationDocument, InAppNotificationModel>('InAppNotification', inAppNotificationSchema);

export { InAppNotification };
