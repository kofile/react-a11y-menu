import * as React from 'react'
import FocusTrap from 'focus-trap-react'
import tabbable from 'tabbable'

interface ContainerProps {
  readonly role: 'menu'
  readonly 'aria-labelledby': string
}

interface ItemProps {
  readonly role: 'menuitem'
  readonly onKeyDown: (event: React.KeyboardEvent<Event>) => void
}

interface RenderOptionsProps {
  readonly containerProps: ContainerProps
  readonly itemProps: ItemProps
}

interface RenderLabelProps {
  readonly isOpen: boolean
}

interface Props {
  readonly id: string
  readonly renderLabel: (opts: RenderLabelProps) => React.ReactNode
  readonly renderOptions: (opts: RenderOptionsProps) => React.ReactNode
  readonly className?: string
}

interface State {
  isOpen: boolean
}

class Menu extends React.Component<Props, State> {
  tabbableElems: Array<HTMLElement> = []
  selectedIndex: number = 0
  containerRef: React.RefObject<HTMLElement> = React.createRef<HTMLElement>()

  state = {
    isOpen: false
  }

  open = () => this.setState({ isOpen: true })
  close = () => this.setState({ isOpen: false })

  handleMenuButtonKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const upperIndex = this.tabbableElems.length - 1

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault()

        if (!this.state.isOpen) {
          this.open()
        }

        break

      case 'ArrowUp':
        event.preventDefault()

        if (!this.state.isOpen) {
          this.setState({ isOpen: true })
        }

        break
    }
  }

  handleMenuKeys = (event: React.KeyboardEvent<Event>) => {
    const upperIndex = this.tabbableElems.length - 1

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break

      case 'ArrowDown':
        event.preventDefault()
        this.selectedIndex = advanceIndex(this.selectedIndex, upperIndex)
        break

      case 'ArrowUp':
        event.preventDefault()
        this.selectedIndex = retreatIndex(this.selectedIndex, upperIndex)
        break

      case 'Home':
        event.preventDefault()
        this.selectedIndex = 0
        break

      case 'End':
        event.preventDefault()
        this.selectedIndex = upperIndex
        break
    }

    const elemToFocus = this.tabbableElems[this.selectedIndex]

    if (elemToFocus) {
      elemToFocus.focus()
    }
  }

  componentDidUpdate() {
    this.tabbableElems = tabbable(this.containerRef.current)
  }

  render() {
    const { isOpen } = this.state
    const { id, className, renderLabel, renderOptions } = this.props

    const controlProps = {
      id,
      className,
      'aria-haspopup': 'menu' as 'menu',
      onClick: isOpen ? this.close : this.open,
      'aria-expanded': !!isOpen,
      onKeyDown: this.handleMenuButtonKeys
    }

    const containerProps = {
      role: 'menu' as 'menu',
      'aria-labelledby': id,
      ref: this.containerRef
    }

    const itemProps = {
      onKeyDown: this.handleMenuKeys,
      role: 'menuitem' as 'menuitem'
    }

    return (
      <React.Fragment>
        <button {...controlProps}>
          {renderLabel({ isOpen })}
        </button>
        {isOpen && (
          <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
            {renderOptions({ containerProps, itemProps })}
          </FocusTrap>
        )}
      </React.Fragment>
    )
  }
}

export default Menu

function advanceIndex(index: number, upperIndex: number) {
  const newIndex = index + 1

  if (newIndex > upperIndex) {
    return 0
  }

  return newIndex
}

function retreatIndex(index: number, upperIndex: number) {
  if (index === null || index === undefined) {
    return upperIndex
  }

  const newIndex = index - 1

  if (newIndex === -1) {
    return upperIndex
  }

  return newIndex
}
