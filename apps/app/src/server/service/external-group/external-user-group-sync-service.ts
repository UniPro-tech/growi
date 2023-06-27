import {
  ExternalGroupProviderType, ExternalUserGroupTreeNode, ExternalUserInfo, IExternalUserGroupHasId,
} from '~/interfaces/external-user-group';
import { IUserHasId } from '~/interfaces/user';
import ExternalUserGroup from '~/server/models/external-user-group';
import ExternalUserGroupRelation from '~/server/models/external-user-group-relation';
import { excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';

import { configManager } from '../config-manager';

abstract class ExternalUserGroupSyncService {

  groupProviderType: ExternalGroupProviderType; // name of external service that contains user group info (e.g: ldap, keycloak)

  authProviderType: string; // auth provider type (e.g: ldap, oidc)

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any, groupProviderType: ExternalGroupProviderType, authProviderType: string) {
    this.groupProviderType = groupProviderType;
    this.authProviderType = authProviderType;
    this.crowi = crowi;
  }

  /** External user group tree sync method
   * 1. Generate external user group tree
   * 2. Use createUpdateExternalUserGroup on each node in the tree using DFS
   * 3. If preserveDeletedLDAPGroups is false、delete all ExternalUserGroups that were not found during tree search
  */
  async syncExternalUserGroups(): Promise<void> {
    const trees = await this.generateExternalUserGroupTrees();

    const existingExternalUserGroupIds: string[] = [];

    const syncNode = async(node: ExternalUserGroupTreeNode, parentId?: string) => {
      const externalUserGroup = await this.createUpdateExternalUserGroup(node, parentId);
      existingExternalUserGroupIds.push(externalUserGroup._id);
      node.childGroupNodes.forEach((childNode) => {
        syncNode(childNode, externalUserGroup._id);
      });
    };

    await Promise.all(trees.map((root) => {
      return syncNode(root);
    }));

    const preserveDeletedLdapGroups: boolean = configManager?.getConfig('crowi', `external-user-group:${this.groupProviderType}:preserveDeletedGroups`);
    if (!preserveDeletedLdapGroups) {
      await ExternalUserGroup.deleteMany({ _id: { $nin: existingExternalUserGroupIds }, groupProviderType: this.groupProviderType });
    }
  }

  /** External user group node sync method
   * 1. Create/Update ExternalUserGroup from using information of ExternalUserGroupTreeNode
   * 2. For every element in node.userInfos, call getMemberUser and create an ExternalUserGroupRelation with ExternalUserGroup if it does not have one
   * 3. Retrun ExternalUserGroup
   * @param {string} node Node of external group tree
   * @param {string} parentId Parent group id (id in GROWI) of the group we wan't to create/update
   * @returns {Promise<IExternalUserGroupHasId>} ExternalUserGroup that was created/updated
  */
  async createUpdateExternalUserGroup(node: ExternalUserGroupTreeNode, parentId?: string): Promise<IExternalUserGroupHasId> {
    const externalUserGroup = await ExternalUserGroup.findAndUpdateOrCreateGroup(
      node.name, node.description, node.id, this.groupProviderType, parentId,
    );
    await Promise.all(node.userInfos.map((userInfo) => {
      return (async() => {
        const user = await this.getMemberUser(userInfo);

        if (user != null) {
          const userGroups = await ExternalUserGroup.findGroupsWithAncestorsRecursively(externalUserGroup);
          const userGroupIds = userGroups.map(g => g._id);

          // remove existing relations from list to create
          const existingRelations = await ExternalUserGroupRelation.find({ relatedGroup: { $in: userGroupIds }, relatedUser: user._id });
          const existingGroupIds = existingRelations.map(r => r.relatedGroup);
          const groupIdsToCreateRelation = excludeTestIdsFromTargetIds(userGroupIds, existingGroupIds);

          await ExternalUserGroupRelation.createRelations(groupIdsToCreateRelation, user);
        }
      })();
    }));

    return externalUserGroup;
  }

  /** Method to get group member GROWI user
   * 1. Search for GROWI user based on user info of 1, and return user
   * 2. If autoGenerateUserOnHogeGroupSync is true and GROWI user is not found, create new GROWI user
   * @param {ExternalUserInfo} externalUserInfo Search external app/server using this identifier
   * @returns {Promise<IUserHasId | null>} User when found or created, null when neither
   */
  async getMemberUser(userInfo: ExternalUserInfo): Promise<IUserHasId | null> {
    const autoGenerateUserOnGroupSync = configManager?.getConfig('crowi', `external-user-group:${this.groupProviderType}:autoGenerateUserOnGroupSync`);

    const getExternalAccount = async() => {
      if (autoGenerateUserOnGroupSync) {
        return this.crowi.externalAccountService.getOrCreateUser(userInfo, this.authProviderType);
      }
      return this.crowi.models.ExternalAccount
        .findOne({ providerType: this.groupProviderType, accountId: userInfo.id });
    };

    const externalAccount = await getExternalAccount();

    if (externalAccount != null) {
      return externalAccount.getPopulatedUser();
    }
    return null;
  }

  /** Method to generate external group tree structure
   * 1. Fetch user group info from external app/server
   * 2. Convert each group tree structure to ExternalUserGroupTreeNode
   * 3. Return the root node of each tree
  */
  abstract generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]>

}

export default ExternalUserGroupSyncService;
