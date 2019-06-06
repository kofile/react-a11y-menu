"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const focus_trap_react_1 = __importDefault(require("focus-trap-react"));
const tabbable_1 = __importDefault(require("tabbable"));
class Menu extends React.Component {
    constructor() {
        super(...arguments);
        this.tabbableElems = [];
        this.menuRef = React.createRef();
        this.containerRef = React.createRef();
        this.state = {
            isOpen: false,
            selectedIndex: 0
        };
        this.open = () => this.setState({ isOpen: true });
        this.close = () => this.setState({ isOpen: false, selectedIndex: 0 });
        this.setSelectedIndex = (i) => this.setState({ selectedIndex: i });
        this.handleMenuButtonKeys = (event) => {
            const upperIndex = this.tabbableElems.length - 1;
            switch (event.key) {
                case 'Enter':
                case ' ':
                case 'ArrowDown':
                    event.preventDefault();
                    if (!this.state.isOpen) {
                        this.open();
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    if (!this.state.isOpen) {
                        this.setState({ isOpen: true });
                    }
                    break;
            }
        };
        this.handleMenuKeys = (event) => {
            const upperIndex = this.tabbableElems.length - 1;
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    this.close();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.setSelectedIndex(advanceIndex(this.state.selectedIndex, upperIndex));
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.setSelectedIndex(retreatIndex(this.state.selectedIndex, upperIndex));
                    break;
                case 'Home':
                    event.preventDefault();
                    this.setSelectedIndex(0);
                    break;
                case 'End':
                    event.preventDefault();
                    this.setSelectedIndex(upperIndex);
                    break;
            }
            if (event.keyCode >= 65 && event.keyCode <= 90) {
                const container = this.containerRef.current;
                if (container) {
                    const children = container.children || [];
                    const childArray = Array.from(children);
                    const nextChildGroup = childArray.slice(this.state.selectedIndex + 1);
                    const prevChildGroup = childArray.slice(0, this.state.selectedIndex);
                    let index = getIndexByFirstChar(nextChildGroup, event);
                    if (index > -1) {
                        return this.setSelectedIndex(this.state.selectedIndex + 1 + index);
                    }
                    index = getIndexByFirstChar(prevChildGroup, event);
                    if (index > -1) {
                        this.setSelectedIndex(index);
                    }
                }
            }
        };
        this.handleClick = (event) => {
            const container = this.containerRef.current;
            const menu = this.menuRef.current;
            if ((container && container.contains(event.target)) ||
                (menu && menu.contains(event.target))) {
                return;
            }
            this.close();
        };
    }
    componentDidMount() {
        window.addEventListener('mousedown', this.handleClick, false);
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleClick, false);
    }
    componentDidUpdate(prevProps, prevState) {
        this.tabbableElems = this.containerRef.current
            ? tabbable_1.default(this.containerRef.current)
            : [];
        if (this.state.selectedIndex !== prevState.selectedIndex) {
            const elemToFocus = this.tabbableElems[this.state.selectedIndex];
            if (elemToFocus) {
                elemToFocus.focus();
            }
        }
    }
    render() {
        const { isOpen } = this.state;
        const { id, className, renderLabel, renderOptions, role } = this.props;
        const controlProps = {
            id,
            className,
            role,
            'aria-haspopup': 'menu',
            onClick: isOpen ? this.close : this.open,
            'aria-expanded': !!isOpen,
            onKeyDown: this.handleMenuButtonKeys,
            ref: this.menuRef
        };
        const containerProps = {
            role: 'menu',
            'aria-labelledby': id,
            ref: this.containerRef
        };
        const itemProps = {
            onKeyDown: this.handleMenuKeys,
            role: 'menuitem'
        };
        return (React.createElement(React.Fragment, null,
            renderLabel && (React.createElement("button", Object.assign({}, controlProps), renderLabel({ isOpen }))),
            isOpen && (React.createElement(focus_trap_react_1.default, { focusTrapOptions: { clickOutsideDeactivates: true } }, renderOptions({
                containerProps,
                itemProps,
                selectedIndex: this.state.selectedIndex,
                close: this.close
            })))));
    }
}
exports.default = Menu;
function advanceIndex(index, upperIndex) {
    const newIndex = index + 1;
    if (newIndex > upperIndex) {
        return 0;
    }
    return newIndex;
}
function retreatIndex(index, upperIndex) {
    if (index === null || index === undefined) {
        return upperIndex;
    }
    const newIndex = index - 1;
    if (newIndex === -1) {
        return upperIndex;
    }
    return newIndex;
}
function getIndexByFirstChar(children, event) {
    return children.findIndex((child) => {
        const childText = child.textContent || '';
        return childText[0] === event.key;
    });
}
