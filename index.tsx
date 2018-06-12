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
  readonly selectedIndex: number
}

interface RenderLabelProps {
  readonly isOpen: boolean
}

interface Props {
  readonly id: string
  readonly renderLabel: (opts: RenderLabelProps) => React.ReactNode
  readonly renderOptions: (opts: RenderOptionsProps) => React.ReactNode
  readonly className?: string
  readonly role?: string
}

interface State {
  isOpen: boolean,
  selectedIndex: number
}

class Menu extends React.Component<Props, State> {
  tabbableElems: Array<HTMLElement> = []
  containerRef: React.RefObject<HTMLElement> = React.createRef<HTMLElement>()

  state = {
    isOpen: false,
    selectedIndex: 0
  }

  open = () => this.setState({ isOpen: true })
  close = () => this.setState({ isOpen: false })

  setSelectedIndex = (i: number) => this.setState({ selectedIndex: i })

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
        this.setSelectedIndex(0)
        this.close()
        break

      case 'ArrowDown':
        event.preventDefault()
        this.setSelectedIndex(advanceIndex(this.state.selectedIndex, upperIndex))
        break

      case 'ArrowUp':
        event.preventDefault()
        this.setSelectedIndex(retreatIndex(this.state.selectedIndex, upperIndex))
        break

      case 'Home':
        event.preventDefault()
        this.setSelectedIndex(0)
        break

      case 'End':
        event.preventDefault()
        this.setSelectedIndex(upperIndex)
        break
    }

    if (event.keyCode >= 65 && event.keyCode <= 90) {
      const container = this.containerRef.current

      if (container) {
        const children = container.children || []
        const childArray = Array.from(children)
        const nextChildGroup = childArray.slice(this.state.selectedIndex + 1)
        const prevChildGroup = childArray.slice(0, this.state.selectedIndex)

        let index = getIndexByFirstChar(nextChildGroup, event)

        if (index > -1) {
          return this.setSelectedIndex(this.state.selectedIndex + 1 + index)
        }

        index = getIndexByFirstChar(prevChildGroup, event)

        if (index > -1) {
          this.setSelectedIndex(index)
        }
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.tabbableElems = this.containerRef.current
      ? tabbable(this.containerRef.current)
      : []

    if (this.state.selectedIndex !== prevState.selectedIndex) {
      const elemToFocus = this.tabbableElems[this.state.selectedIndex]

      if (elemToFocus) {
        elemToFocus.focus()
      }
    }
  }

  render() {
    const { isOpen } = this.state
    const { id, className, renderLabel, renderOptions, role } = this.props

    const controlProps = {
      id,
      className,
      role,
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
            {renderOptions({
              containerProps,
              itemProps,
              selectedIndex: this.state.selectedIndex
            })}
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

function getIndexByFirstChar(
  children: Array<Element>,
  event: React.KeyboardEvent<Event>
) {
  return children.findIndex((child: Element) => {
    const childText = child.textContent || ''

    return childText[0] === event.key
  })
}
