import React, {
  FC, useCallback,
} from 'react';
import AppContainer from '../../client/services/AppContainer';
import NavigationContainer from '../../client/services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';
import { useSWRPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';


type SubNavButtonsProps= {
  appContainer: AppContainer,
  navigationContainer: NavigationContainer,
  isCompactMode?: boolean,
  pageId: string,
  revisionId: string,
  path: string,
  isDeletable: boolean,
  isAbleToDeleteCompletely: boolean,
}
const SubNavButtons: FC<SubNavButtonsProps> = (props: SubNavButtonsProps) => {
  const {
    appContainer, navigationContainer, isCompactMode, pageId, revisionId, path, isDeletable, isAbleToDeleteCompletely,
  } = props;
  const { editorMode } = navigationContainer.state;
  const isViewMode = editorMode === 'view';
  const { isGuestUser } = appContainer;

  const { data: pageInfo, error: pageInfoError, mutate: mutatePageInfo } = useSWRPageInfo(pageId);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId);

  const likeClickhandler = useCallback(async() => {
    if (isGuestUser) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await apiv3Put('/page/likes', { pageId, bool: !pageInfo!.isLiked });
      mutatePageInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [pageInfo]);

  const bookmarkClickHandler = useCallback(async() => {
    if (isGuestUser) {
      return;
    }
    try {
      await apiv3Put('/bookmarks', { pageId, bool: !bookmarkInfo.isBookmarked });
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkInfo]);


  if (pageInfoError != null || pageInfo == null) {
    return <></>;
  }

  if (bookmarkInfoError != null || bookmarkInfo == null) {
    return <></>;
  }

  const { sumOfLikers, likerIds, isLiked } = pageInfo;
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo;

  return (
    <>
      {isViewMode && (
        <PageReactionButtons
          pageId={pageId}
          sumOfLikers={sumOfLikers}
          likerIds={likerIds}
          isLiked={isLiked}
          onLikeClicked={likeClickhandler}
          sumOfBookmarks={sumOfBookmarks}
          isBookmarked={isBookmarked}
          onBookMarkClicked={bookmarkClickHandler}
        >
        </PageReactionButtons>
      )}
      {/*
        TODO :
        once 80335 is done, merge 77543 branch(parent of 80335) into 77524.
        (pageContainer dependencies in bookmark, delete modal, rename etc are removed)
        then place PageManagement here.
        TASK: https://estoc.weseek.co.jp/redmine/issues/81076
        CONDITION :isAbleToShowPageManagement = !isNotFoundPage && !isTrashPage && !isSharedUser
      */}
      {/* if (CONDITION) then <PageManagement isCompactMode> */}
      <PageManagement
        pageId={pageId}
        revisionId={revisionId}
        path={path}
        isDeletable={isDeletable}
        isAbleToDeleteCompletely={isAbleToDeleteCompletely}
      >

      </PageManagement>
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const SubNavButtonsUnstatedWrapper = withUnstatedContainers(SubNavButtons, [AppContainer, NavigationContainer]);

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const SubNavButtonsWrapper = (props) => {
  return <SubNavButtonsUnstatedWrapper {...props}></SubNavButtonsUnstatedWrapper>;
};

export default SubNavButtonsWrapper;
