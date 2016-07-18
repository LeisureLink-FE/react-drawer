import { Component, Children, cloneElement } from 'react';

export default class Drawer extends Component {
  constructor(props) {
    super(props);
    const isOpen = !!Children
      .map(props.children, child => child)
      .filter(child => child.props && child.props.target)
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
    }
    return cloneElement(trigger, { onClick }, ...(trigger.children || []))
  }
  
  _upgradeTarget(target) {
    const drawer = this;
    
    const ref = (t) => {
      if(t && t.nodeName && drawer.state.memoizedTargetHeight == 0) {
        var height = 0;
        var origPosStyle = t.style.position;
        t.style.position = 'absolute';
        t.style.maxHeight = '100vh';
        setTimeout(() => {
          height = Number.parseInt(window.getComputedStyle(t).height, 10);
          if(height) {
            t.style.maxHeight = 0;
            setTimeout(() => {
              t.style.position = origPosStyle;
              t.style.transition = '.2s max-height linear';
              setTimeout(() => {
                drawer.setState({memoizedTargetHeight: height});
                t.style.opacity = 1;
              },10);
            }, 10);
          }
        }, 10);
      }
    };
    
    const maxHeight = drawer.state.isOpen ? (drawer.state.memoizedTargetHeight || '100vh') : 0;
    
    const style = {
      ...target.props.style,
      maxHeight,
      opacity:0,
      overflow: 'hidden'
    };
    
    return cloneElement(target, { ref, style }, ...(target.children || []));
    
  }
  
  _close() {
    this.setState({isOpen: false});
  }
  
  render() {
    const drawer = this;
    
    const children = Children.map(drawer.props.children, (child) => {
      if (!child || !child.props) { return child; }
      if (child.props.trigger) {
        return drawer._upgradeTrigger.bind(drawer)(child);
      } else if (child.props.target) {
        return drawer._upgradeTarget.bind(drawer)(child);
      }
      return child;
    });
    
    const props = { ...drawer.props, open: drawer.state.isOpen, children };
    
    if(drawer.props.closeOnBlur) {
      props.tabIndex=0;
      props.onBlur = drawer._close.bind(drawer);
    }
    return <div { ...props } />
  }
}
