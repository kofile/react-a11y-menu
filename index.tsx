import * as React from 'react'
import md5 from 'md5-o-matic'
import View from './View'

interface FinalOptionProps {
  readonly innerRef: (el: HTMLElement) => void
  readonly id: string
  readonly role: string
  readonly tabIndex: number
  readonly onClick?: () => void
  readonly onKeyDown: (e: React.KeyboardEvent<Event>) => void
}

type OptionProps = [string, FinalOptionProps, React.ReactNode]
type Options = Array<OptionProps>
type Ref = React.RefObject<HTMLElement>
type RecordRef = (ref: Ref) => void
type OnClick = () => void
type HandleMenuButtonKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => void
type KeyboardEvent = (event: React.KeyboardEvent<Event>) => void
type HandleMenuKeys = (onClickHandler: OnClick) => KeyboardEvent

interface GenerateOption {
  prefix: string
  recordRef: RecordRef
  onKeyDown: HandleMenuKeys
  close: () => void
}

interface GenerateOptions extends GenerateOption {
  options: Options
}

export interface ViewProps {
  readonly isOpen: boolean
  readonly label: React.ReactNode
  readonly options: Array<[string, React.ReactNode]>
  readonly controlProps: {
    readonly 'aria-haspopup': 'menu'
    readonly onClick: OnClick
    readonly 'aria-expanded': boolean
    readonly id: string
    readonly onKeyDown: HandleMenuButtonKeys
    readonly ref: React.RefObject<HTMLButtonElement>
    readonly className?: string
  }
}

interface Props {
  readonly isOpen?: boolean
  readonly id: string
  readonly label: React.ReactNode
  readonly options: Options
  readonly className?: string
}

interface State {
  isOpen?: boolean
  menuItemFocusIndex: number
}

class Menu extends React.Component<Props, State> {
  menuItemRefs: Array<React.RefObject<HTMLElement>> = []
  controlRef: React.RefObject<HTMLButtonElement> = React.createRef()

  state = {
    isOpen: this.props.isOpen,
    menuItemFocusIndex: 0
  }

  constructor(props: Props) {
    super(props)

    /**
     * We rely on options being unique amongst their peers in order to keep
     * track of the automatically generated refs
     */
    checkForDuplicateOptions(props.options)
  }

  static defaultProps = {
    isOpen: false
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    checkForDuplicateOptions(props.options)

    return {
      isOpen: props.isOpen,
      menuItemFocusIndex: 0
    }
  }

  /**
   * Handler for opening the menu, which sets the menu state to open and
   * automatically focuses the first menu option.
   */
  open = () => {
    this.setState({ isOpen: true, menuItemFocusIndex: 0 })
  }

  /**
   * Handler for closing the menu. Clears out our dynamic ref tracking.
   *
   * NOTE: When migrating to the new createRef API, this "clearing" step will
   * possibly become unnecessary.
   */
  close = () => {
    this.setState({ isOpen: false, menuItemFocusIndex: 0 })
    this.menuItemRefs = []
  }

  refMenuItem: RecordRef = ref => {
    this.menuItemRefs.push(ref)
  }

  /**
   * Handler for keyboard actions on the menu control
   */
  handleMenuButtonKeys: HandleMenuButtonKeys = event => {
    const upperIndex = this.props.options.length - 1

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
          this.setState({ isOpen: true, menuItemFocusIndex: upperIndex })
        }

        break
    }
  }

  /**
   * Handle keyboard navigation of menu items
   */
  handleMenuKeys: HandleMenuKeys = onClickHandler => event => {
    const { menuItemFocusIndex } = this.state
    const upperIndex = this.props.options.length - 1

    let newIndex = 0

    switch (event.key) {
      case 'Escape':
        this.close()
        break

      case 'ArrowDown':
        newIndex = advanceIndex(menuItemFocusIndex, upperIndex)
        this.setState({ menuItemFocusIndex: newIndex })
        break

      case 'ArrowUp':
        newIndex = retreatIndex(menuItemFocusIndex, upperIndex)
        this.setState({ menuItemFocusIndex: newIndex })
        break

      case 'Home':
        this.setState({ menuItemFocusIndex: 0 })
        break

      case 'End':
        this.setState({ menuItemFocusIndex: upperIndex })
        break

      case 'Enter':
        event.stopPropagation()
        onClickHandler()
        break
    }
  }

  componentDidUpdate() {
    const { menuItemFocusIndex, isOpen } = this.state

    this.menuItemRefs = this.menuItemRefs.filter(r => !!r.current)

    if (isOpen) {
      const { current } = this.menuItemRefs[menuItemFocusIndex]

      if (current) {
        current.focus()
      }
    } else if (this.controlRef.current) {
      this.controlRef.current.focus()
    }
  }

  render() {
    const { isOpen } = this.state

    const controlProps = {
      'aria-haspopup': 'menu' as 'menu',
      onClick: isOpen ? this.close : this.open,
      'aria-expanded': !!isOpen,
      id: this.props.id,
      onKeyDown: this.handleMenuButtonKeys,
      ref: this.controlRef,
      className: this.props.className
    }

    const props = {
      isOpen: isOpen || false,
      controlProps,
      label: this.props.label,
      options: generateOptions({
        prefix: this.props.id,
        options: this.props.options,
        recordRef: this.refMenuItem,
        onKeyDown: this.handleMenuKeys,
        close: this.close
      })
    }

    return <View {...props} />
  }
}

export default Menu

function hasDuplicates(options: Options) {
  const optionsSet = new Set()

  options.forEach(option => optionsSet.add(JSON.stringify(option)))

  return options.length !== optionsSet.size
}

function checkForDuplicateOptions(options: Options) {
  if (hasDuplicates(options)) {
    throw new Error('Each menu option must be unique')
  }
}

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

function generateOptions({ prefix, options, recordRef, onKeyDown, close }: GenerateOptions) {
  return options.map(generateOption({ prefix, recordRef, onKeyDown, close }))
}

function generateOption({ prefix, recordRef, onKeyDown, close }: GenerateOption) {
  return (optionProps: OptionProps): [string, React.ReactNode] => {
    const [element, userProps, children] = optionProps
    const id = `${prefix}--${md5(JSON.stringify(optionProps))}`
    const ref = React.createRef<HTMLElement>()

    recordRef(ref)

    const doUserAction = () => {
      close()

      if (userProps.onClick) {
        userProps.onClick()
      }
    }

    const props = {
      ...userProps,
      onClick: (event: React.SyntheticEvent<MouseEvent>) => {
        doUserAction()
      },
      id,
      role: 'menuitem',
      tabIndex: -1
    }

    const finalProps =
      typeof element === 'string'
        ? { ...props, ref }
        : { ...props, innerRef: ref }

    finalProps.onKeyDown = onKeyDown(() => {
      doUserAction()
    })

    return [id, React.createElement(element, finalProps, children)]
  }
}
