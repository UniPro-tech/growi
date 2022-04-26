
import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('UserGroupService', () => {
  jest.setTimeout(60000);
  let crowi;
  let User;
  let UserGroup;
  let UserGroupRelation;

  const groupId1 = new mongoose.Types.ObjectId();
  const groupId2 = new mongoose.Types.ObjectId();
  const groupId3 = new mongoose.Types.ObjectId();
  const groupId4 = new mongoose.Types.ObjectId();
  const groupId5 = new mongoose.Types.ObjectId();


  beforeAll(async() => {
    crowi = await getInstance();
    User = mongoose.model('User');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    // Create Users
    await User.insertMany([
      { name: 'user1', username: 'user1', email: 'user1@example.com' },
    ]);


    // Create Groups
    await UserGroup.insertMany([
      // No parent
      {
        _id: groupId1,
        name: 'v5_group1',
        description: 'description1',
      },
      // No parent
      {
        _id: groupId2,
        name: 'v5_group2',
        description: 'description2',
      },
      // No parent
      {
        _id: groupId3,
        name: 'v5_group3',
        description: 'description3',
      },
      // No parent
      {
        _id: groupId4,
        name: 'v5_group4',
        description: 'description4',
      },
      // No parent
      {
        _id: groupId5,
        name: 'v5_group5',
        description: 'description5',
      },
    ]);

    const user1 = await User.findOne({ username: 'user1' });
    const userGroup4 = await UserGroup.findOne({ _id: groupId4 });

    // Create UserGroupRelations
    await UserGroupRelation.insertMany([
      {
        // _id: userGroupRelationId1,
        relatedGroup: userGroup4,
        relatedUser: user1,
        createdAt: new Date(),
      },
    ]);

  });

  /*
    * Update UserGroup
    */
  test('Updated values should be reflected. (name, description, parent)', async() => {
    const userGroup1 = await UserGroup.findOne({ _id: groupId1 });
    const userGroup2 = await UserGroup.findOne({ _id: groupId2 });

    const newGroupName = 'v5_group1_new';
    const newGroupDescription = 'description1_new';
    const newParentId = userGroup2._id;

    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup1._id, newGroupName, newGroupDescription, newParentId);

    expect(updatedUserGroup.name).toBe(newGroupName);
    expect(updatedUserGroup.description).toBe(newGroupDescription);
    expect(updatedUserGroup.parent).toStrictEqual(newParentId);
  });

  test('Should throw an error when trying to set existing group name', async() => {
    const userGroup1 = await UserGroup.findOne({ _id: groupId1 });
    const userGroup2 = await UserGroup.findOne({ _id: groupId2 });

    const result = crowi.userGroupService.updateGroup(userGroup1._id, userGroup2.name);

    await expect(result).rejects.toThrow('The group name is already taken');
  });

  test('Parent should be null when parent group is released', async() => {
    const userGroup = await UserGroup.findOne({ _id: groupId3 });
    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup._id, userGroup.name, userGroup.description, null);

    expect(updatedUserGroup.parent).toBeNull();
  });

  // In case that forceUpdateParents is false
  test('Should throw an error when users in child group do not include in parent group', async() => {
    const userGroup4 = await UserGroup.findOne({ _id: groupId4 });
    const userGroup5 = await UserGroup.findOne({ _id: groupId5 });

    const result = crowi.userGroupService.updateGroup(userGroup4._id, userGroup4.name, userGroup4.description, userGroup5._id);

    await expect(result).rejects.toThrow('The parent group does not contain the users in this group.');
  });

  // In case that forceUpdateParents is true
  test('User should be included to parent group forcibly in case that force update is true', async() => {
    const userGroup4 = await UserGroup.findOne({ _id: groupId4 });
    const userGroup4Relation = await UserGroupRelation.findOne({ relatedGroup:  userGroup4 });
    const userGroup5 = await UserGroup.findOne({ _id: groupId5 });

    const forceUpdateParents = true;

    await crowi.userGroupService.updateGroup(userGroup4._id, userGroup4.name, userGroup4.description, userGroup5._id, forceUpdateParents);
    const relatedGroup = await UserGroupRelation.findOne({ relatedGroup: userGroup5._id, relatedUser: userGroup4Relation.relatedUser });

    expect(relatedGroup).toBeTruthy();
  });

});
