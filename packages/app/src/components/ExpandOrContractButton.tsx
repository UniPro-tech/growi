import React, { FC } from 'react';


type Props = {
  isWindowExpanded: boolean,
  color?: string,
  contractWindow?: () => void,
  expandWindow?: () => void,
};

const ExpandOrContractButton: FC<Props> = (props: Props) => {
  const { isWindowExpanded, contractWindow, expandWindow } = props;

  const clickContractButtonHandler = (): void => {
    if (contractWindow != null) {
      contractWindow();
    }
  };

  const clickExpandButtonHandler = (): void => {
    if (expandWindow != null) {
      expandWindow();
    }
  };

  let buttonColorClassWithOneSpace: string | null = null;
  if (props.color != null) {
    buttonColorClassWithOneSpace = ` text-${props.color}`;
  }

  return (
    <button
      type="button"
      className={`close${buttonColorClassWithOneSpace || ''}`}
      onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}
    >
      <i className={`${isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen'}`} style={{ fontSize: '0.8em' }} aria-hidden="true"></i>
    </button>
  );
};


export default ExpandOrContractButton;
