import React, { type ReactNode, useCallback, useEffect } from 'react';

import { Origin } from '@growi/core';
import { useGlobalSocket } from '@growi/core/dist/swr';
import { useTranslation } from 'next-i18next';


import { useCreatePageAndTransit } from '~/client/services/create-page';
import { toastError } from '~/client/util/toastr';
import { SocketEventName } from '~/interfaces/websocket';
import { useIsNotFound, useHasYjsDraft } from '~/stores/page';
import { EditorMode, useEditorMode, useIsDeviceLargerThanMd } from '~/stores/ui';

import { shouldCreateWipPage } from '../../utils/should-create-wip-page';


import styles from './PageEditorModeManager.module.scss';


type PageEditorModeButtonProps = {
  currentEditorMode: EditorMode,
  editorMode: EditorMode,
  children?: ReactNode,
  isBtnDisabled?: boolean,
  onClick?: () => void,
}
const PageEditorModeButton = React.memo((props: PageEditorModeButtonProps) => {
  const {
    currentEditorMode, isBtnDisabled, editorMode, children, onClick,
  } = props;

  const classNames = ['btn py-1 px-2 d-flex align-items-center justify-content-center'];
  if (currentEditorMode === editorMode) {
    classNames.push('active');
  }
  if (isBtnDisabled) {
    classNames.push('disabled');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={onClick}
      data-testid={`${editorMode}-button`}
    >
      {children}
    </button>
  );
});

type Props = {
  editorMode: EditorMode | undefined,
  isBtnDisabled: boolean,
  path?: string,
}

export const PageEditorModeManager = (props: Props): JSX.Element => {
  const {
    editorMode = EditorMode.View,
    isBtnDisabled,
    path,
  } = props;

  const { t } = useTranslation('commons');

  const { data: isNotFound } = useIsNotFound();
  const { mutate: mutateEditorMode } = useEditorMode();
  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();
  const { data: hasYjsDraft, mutate: mutateHasYjsDraft } = useHasYjsDraft();
  const { data: socket } = useGlobalSocket();

  const { isCreating, createAndTransit } = useCreatePageAndTransit();

  const editButtonClickedHandler = useCallback(async() => {
    if (isNotFound == null || isNotFound === false) {
      mutateEditorMode(EditorMode.Editor);
      return;
    }

    try {
      await createAndTransit(
        { path, wip: shouldCreateWipPage(path), origin: Origin.View },
        { shouldCheckPageExists: true },
      );
    }
    catch (err) {
      toastError(t('toaster.create_failed', { target: path }));
    }
  }, [createAndTransit, isNotFound, mutateEditorMode, path, t]);

  useEffect(() => {

    if (socket == null) { return }

    const yjsDraftUpdateHandler = (hasYjsDraft: boolean) => {
      mutateHasYjsDraft(hasYjsDraft);
    };

    socket.on(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);
    };

  }, [mutateHasYjsDraft, socket]);

  const _isBtnDisabled = isCreating || isBtnDisabled;

  return (
    <>
      <div
        className={`btn-group grw-page-editor-mode-manager ${styles['grw-page-editor-mode-manager']}`}
        role="group"
        aria-label="page-editor-mode-manager"
        id="grw-page-editor-mode-manager"
      >
        {(isDeviceLargerThanMd || editorMode !== EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.View}
            isBtnDisabled={_isBtnDisabled}
            onClick={() => mutateEditorMode(EditorMode.View)}
          >
            <span className="material-symbols-outlined fs-4">play_arrow</span>{t('View')}
          </PageEditorModeButton>
        )}
        {(isDeviceLargerThanMd || editorMode === EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.Editor}
            isBtnDisabled={_isBtnDisabled}
            onClick={editButtonClickedHandler}
          >
            <span className="material-symbols-outlined me-1 fs-5">edit_square</span>{t('Edit')}
            { hasYjsDraft && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-primary rounded-circle" />}
          </PageEditorModeButton>
        )}
      </div>
    </>
  );

};
