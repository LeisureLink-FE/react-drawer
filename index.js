import { Component, Children, cloneElement } from 'react';

export default class Drawer extends Component {
  static defautProps() {
    return {
      closeOnBlur: false,
      tabIndex: 0,
      onBlur: () => {}
    }
  }

  constructor(props) {
    super(props);
    const isOpen = !!Children
        .map(props.children, child => child)
        .filter(child => child.props && child.props.id === props.target)
        .find(child => child.props.open);

    this.state = {
      isOpen,
      memoizedTargetHeight: 0
    };

    this._handleTrigger.bind(this);
    this._upgradeTarget.bind(this);
    this._upgradeTrigger.bind(this);
    this.close.bind(this);

  }

  _handleTrigger() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  _upgradeTrigger(trigger) {
    const onClick = () => {
      this._handleTrigger();
      (trigger.props.onClick || (() => {}))();
    };
    return cloneElement(trigger, { onClick }, ...(trigger.children || []))
  }

  _upgradeTarget(target) {
    const ref = (t) => this._targetRef = t;

    const oldTargetOnTransitionEnd = target.props.onTransitionEnd || (() => {});
    const onTransitionEnd = () => {
      const height = Number.parseInt(window.getComputedStyle(this._targetRef).height, 10);
      if (height) {
        this.setState({ memoizedTargetHeight: height });
      }
      oldTargetOnTransitionEnd();
    };

    const maxHeight = this.state.isOpen ? (this.state.memoizedTargetHeight || '100vh') : 0;

    const style = {
      ...target.props.style,
      transition: '.25s max-height linear',
      maxHeight,
      overflow: 'auto'
    };

    return cloneElement(target, { ref, onTransitionEnd, style }, ...(target.children || []));
  }

  close() {
    this.setState({isOpen: false});
  }

  render() {
    const children = Children.map(this.props.children, (child) => {
      if (!child || !child.props) { return child; }
      if (child.props.id === this.props.trigger) {
        return this._upgradeTrigger(child);
      } else if (child.props.id === this.props.target) {
        return this._upgradeTarget(child);
      }
      return child;
    });

    const props = { ...this.props, open: this.state.isOpen, children };

    const { closeOnBlur, target, trigger, ...childProps } = props;

    if(closeOnBlur) {
      childProps.tabIndex=0;
      childProps.onBlur = this.close.bind(this); //Doesn't seem like I should need to bind but...
    }
    return <div { ...childProps } />
  }
}
