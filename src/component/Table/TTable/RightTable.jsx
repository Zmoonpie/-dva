import React from 'react';
import BaseTable from '../BaseTable';

export default function RightTable(props) {
  /* 重写 x 其他 直接传 */
  const { x, triggerType, triggerTypePrev, ...others } = props;
  const i = triggerType === 1 ? 1 : -1;
  let computedX = -i * x;
  if (triggerTypePrev === 1 && triggerType === 3) {
    /* 弥补突变 */
    computedX += -2* x;
  }
  if (triggerTypePrev === 3 && triggerType === 1) {
    /* 弥补突变 */
    computedX += 2* x;
  }
  // console.log(x, triggerType, triggerTypePrev);
  // console.log('实际的x', computedX);
  return (
    <BaseTable
      {...others}
      x={computedX}
    />
  );
}
