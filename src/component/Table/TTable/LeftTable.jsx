import React from 'react';
import BaseTable from '../BaseTable';

export default function LeftTable(props) {
  const { x, scrollWidth, triggerType, triggerTypePrev, ...others } = props;
  const i = triggerType === 1 ? 1 : -1;
  let computedX = i * x - scrollWidth;
  if (triggerTypePrev === 3 && triggerType === 1) {
    /* 弥补突变 */
    computedX += -2* x;
  }
  if (triggerTypePrev === 1 && triggerType === 3) {
    /* 弥补突变 */
    computedX += 2* x;
  }
  // console.log('triggerType', triggerType);
  // console.log('triggerTypePrev', triggerTypePrev)
  // console.log('x', x)
  // console.log('实际的x', computedX);
  return <BaseTable {...others} x={computedX} />;
}
