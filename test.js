import test from 'tape';
import Drawer from './index';
import { shallow, mount } from 'enzyme';
import jsdom from 'jsdom';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

//Super gross but apparently enzyme requires a global browser-like env for `mount`
// https://github.com/airbnb/enzyme/issues/75
global.document = doc;
global.window = win;

const drawer = (
  <Drawer>
    <div trigger>I'm a trigger</div>
    <ul target>
      <li>I'm the target</li>
    </ul>
  </Drawer>
);

const openDrawer = (
  <Drawer>
    <div trigger>I'm a trigger</div>
    <ul target open>
      <li>I'm the target</li>
    </ul>
  </Drawer>
);

const wrapped = shallow(drawer);
const openWrapped = shallow(openDrawer);

const trigger = wrapped.find('[trigger]');
const target = wrapped.find('[target]');
const openTarget = openWrapped.find('[target]');

test('<Drawer /> shallow testing.', t => {

  t.equal(trigger.length, 1, 'Drawer should the passed in trigger as a child');
  t.equal(target.length, 1, 'Drawer should the passed in target as a child');
  t.equal(target.props().style.maxHeight, 0, 'target should have a maxHeight style of `0` when not open');
  t.equal(openTarget.props().style.maxHeight, '100vh', 'target should have a maxHeight style of `100vh` when open');
  t.equal(target.props().style.transition, '.25s max-height linear', 'target should have a transition style of `.25s max-height linear`');

  const clickable = mount(drawer);
  global = window;
  clickable.find('[trigger]').simulate('click')
  t.equal(clickable.state().isOpen, true, '`isOpen` state should toggle when `trigger` is clicked')

  t.end();
});
