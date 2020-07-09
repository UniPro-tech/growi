import React from 'react';
import PropTypes from 'prop-types';
import { GlobalHotKeys } from 'react-hotkeys';

export default class HotkeysDetector extends React.Component {

  constructor(props) {
    super(props);
    this.hotkeyList = this.props.hotkeyList;
    this.state = {
      userCommand: [],
    };
    this.processingCommands = [];
    this.check = this.check.bind(this);
  }

  check(event) {

    const target = event.target;
    // ignore when target dom is input
    const inputPattern = /^input|textinput|textarea$/i;
    if (inputPattern.test(target.tagName) || target.isContentEditable) {
      return;
    }
    this.processingCommands = this.hotkeyList;

    if (event.ctrlKey) {
      this.processingCommands = this.processingCommands.filter((value) => {
        return value.ctrlKey;
      });
    }
    else if (event.metaKey) {
      this.processingCommands = this.processingCommands.filter((value) => {
        return value.metaKey;
      });
    }
    else if (event.altKey) {
      this.processingCommands = this.processingCommands.filter((value) => {
        return value.altKey;
      });
    }
    else if (event.shiftKey) {
      this.processingCommands = this.processingCommands.filter((value) => {
        return value.shiftKey;
      });
    }
    else {
      this.processingCommands = this.processingCommands.filter((value) => {
        return ((!value.ctrlKey) && (!value.metaKey) && (!value.altKey) && (!value.shiftKey));
      });
    }
    this.setState({
      userCommand: this.state.userCommand.concat(event.key),
    });
    // filters the corresponding hotkeys(keys) that the user has pressed so far
    const tempUserCommand = this.state.userCommand;
    this.processingCommands = this.processingCommands.filter((value) => {
      return value.stroke.slice(0, tempUserCommand.length).toString() === tempUserCommand.toString();
    });
    this.processingCommands = this.processingCommands.map((value) => {
      return value.stroke;
    });

    // executes if there were keymap that matches what the user pressed fully.
    if ((this.processingCommands.length === 1) && (this.hotkeyList.find(obj => obj.stroke.toString() === this.state.userCommand.toString()))) {
      this.props.onDetected(this.processingCommands[0]);
      this.setState({
        userCommand: [],
      });
    }
    else if (this.processingCommands.toString() === [].toString()) {
      this.setState({
        userCommand: [],
      });
    }
    return null;

  }

  render() {
    const keyMap = { check: this.props.keymap };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
      </GlobalHotKeys>
    );
  }

}

HotkeysDetector.propTypes = {
  onDetected: PropTypes.func.isRequired,
  keymap: PropTypes.array.isRequired,
  hotkeyList: PropTypes.array.isRequired,
};
