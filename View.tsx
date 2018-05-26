import * as React from 'react'
import { ViewProps } from '.'

const View: React.SFC<ViewProps> = props => (
  <React.Fragment>
    <button {...props.controlProps}>
      {props.label({ isOpen: props.isOpen })}
    </button>
    {props.isOpen && (
      <ul
        role='menu'
        aria-labelledby={props.controlProps.id}
      >
        {props.options.map(([id, option]) => (
          <li role='presentation' key={id}>
            {option}
          </li>
        ))}
      </ul>
    )}
  </React.Fragment>
)

export default View
