import { Component, Children, cloneElement } from 'react';

export default class Drawer extends Component {
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
  }

  _handleTrigger() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  _upgradeTrigger(trigger) {
    const drawer = this;
    const oldTriggerOnClick = trigger.props.onClick || (() => {});
    const boundTriggerHandler = drawer._handleTrigger.bind(drawer);
    const onClick = () => {
      boundTriggerHandler();
      oldTriggerOnClick();
    };
    return cloneElement(trigger, { onClick, trigger:false }, ...(trigger.children || []))
  }

  _upgradeTarget(target) {
    const drawer = this;
    const ref = (t) => drawer._targetRef = t;

    const oldTargetOnTransitionEnd = target.props.onTransitionEnd || (() => {});
    const onTransitionEnd = () => {
      const height = Number.parseInt(window.getComputedStyle(drawer._targetRef).height, 10);
      if (height) {
        drawer.setState({ memoizedTargetHeight: height });
      }
      oldTargetOnTransitionEnd();
    };

    const maxHeight = drawer.state.isOpen ? (drawer.state.memoizedTargetHeight || '100vh') : 0;

    const style = {
      ...target.props.style,
      transition: '.25s max-height linear',
      maxHeight,
      overflow: 'auto'
    };

    return cloneElement(target, { ref, onTransitionEnd, style, target:false }, ...(target.children || []));
  }

  _close() {
    this.setState({isOpen: false});
  }

  render() {
    const drawer = this;

    const children = Children.map(drawer.props.children, (child) => {
      if (!child || !child.props) { return child; }
      if (child.props.id === drawer.props.trigger) {
        return drawer._upgradeTrigger.bind(drawer)(child);
      } else if (child.props.id === drawer.props.target) {
        return drawer._upgradeTarget.bind(drawer)(child);
      }
      return child;
    });

    const props = { ...drawer.props, open: drawer.state.isOpen, children };

    const { trigger, target, closeOnBlur, ...childProps } = props;

    if(drawer.props.closeOnBlur) {
      props.tabIndex=0;
      props.onBlur = drawer._close.bind(drawer);
    }
    return <div { ...childProps } />
  }
}
