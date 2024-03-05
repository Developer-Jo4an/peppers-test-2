import { InputController } from "./input-controller.js"
import { KeyboardPlugin } from './plugins/KeyboardPlugin.js'
import { MousePlugin } from './plugins/MousePlugin.js'

const controllerLogic = () => {
    // main node
    const square = document.querySelector('.square')
    // controller
    const controller = new InputController()
    // buttons
    // attach / detach btns
    const attachBtn = document.querySelector('#attach-btn')
    const detachBtn = document.querySelector('#detach-btn')
    const dontEnabledBtn = document.querySelector('#dont-enabled-btn')
    // enable / disable btns
    const enableBtn = document.querySelector('#enable-btn')
    const disableBtn = document.querySelector('#disable-btn')
    // add actions btn
    const addActionsBtn = document.querySelector('#add-actions-btn')
    const addBounceBtn = document.querySelector('#add-bounce-btn')
    // enabled actions btns
    const enableUpBtn = document.querySelector('#enable-up-btn')
    const enableDownBtn = document.querySelector('#enable-down-btn')
    const enableLeftBtn = document.querySelector('#enable-left-btn')
    const enableRightBtn = document.querySelector('#enable-right-btn')
    const enableBounceBtn = document.querySelector('#enable-bounce-btn')
    // Plugins
    const addKeyboardPluginBtn = document.querySelector('#add-keyboard-plugin')
    const removeKeyboardPluginBtn = document.querySelector('#remove-keyboard-plugin')
    const addMousePluginBtn = document.querySelector('#add-mouse-plugin')
    const removeMousePluginBtn = document.querySelector('#remove-mouse-plugin')

    // Actions class
    class Action {
        constructor(name, keys, mouses, enabled, btn) {
            this.name = name
            this.keys = keys
            this.buttons = mouses
            this.enabled = enabled
            this.$btn = btn
        }

        setEnabled(enabled) {
            this.enabled = enabled
            this.$btn.firstElementChild.innerHTML = enabled.toString()
        }

        getControllerAction() {
            return {
                [this.name]: {
                    buttons: this.buttons,
                    keys: this.keys,
                    enabled: this.enabled
                }
            }
        }
    }

    // All actions object
    const actionsObject = {
        up: new Action('up', [87, 38], [4], false, enableUpBtn),
        down: new Action('down', [83, 40], [3], false, enableDownBtn),
        left: new Action('left', [65, 37], [0],false,  enableLeftBtn),
        right: new Action('right', [68, 39], [2], false, enableRightBtn)
    }

    // Bounce Action object
    const bounceActionObject = { bounce: new Action('bounce', [32], [1], false, enableBounceBtn) }

    // actions array
    const mainActionArr = Object.entries(actionsObject)
    const bounceActionArr = Object.entries(bounceActionObject)
    const allActionsArr = [...mainActionArr, ...bounceActionArr]

    // Testing

    // Reducer logic
    const delPostfix = str => str.slice(0, str.length - 2)

    const moveReducer = ({ detail }) => {
        const { actions } = detail
        console.log(actions)
        actions.forEach(action => {
            switch (action) {
                case actionsObject.up.name: {
                    square.style.top = `${+delPostfix(square.style.top) - 3}px`
                    break
                }
                case actionsObject.down.name: {
                    square.style.top = `${+delPostfix(square.style.top) + 3}px`
                    break
                }
                case actionsObject.left.name: {
                    square.style.left = `${+delPostfix(square.style.left) - 3}px`
                    break
                }
                case actionsObject.right.name: {
                    square.style.left = `${+delPostfix(square.style.left) + 3}px`
                    break
                }
                case bounceActionObject.bounce.name: {
                    square.style.backgroundSize = '75% 95%'
                    setTimeout(() => square.style.backgroundSize = '55% 75%', 300)
                    break
                }
            }
        })
    }

    // add/remove plugins
    addKeyboardPluginBtn.addEventListener('click', () => {
        controller.registerPlugin({ type: 'keyboard', plugin: new KeyboardPlugin(controller) })
    })
    removeKeyboardPluginBtn.addEventListener('click', () => controller.removePlugin('keyboard'))
    addMousePluginBtn.addEventListener('click', () => {
        controller.registerPlugin({ type: 'mouse', plugin: new MousePlugin(controller) })
    })
    removeMousePluginBtn.addEventListener('click', () => controller.removePlugin('mouse'))
    // enable / disable controller
    enableBtn.addEventListener('click', controller.enableController.bind(controller))
    disableBtn.addEventListener('click', controller.disableController.bind(controller))

    // Attach logic
    const enabledAttachObj = {
        enabled: false,
        btns: {
            attachBtn: attachBtn,
            detachBtn: detachBtn,
            dontEnabledBtn: dontEnabledBtn,
        },
        setEnabled() {
            this.enabled = !this.enabled
            this.btns.dontEnabledBtn.firstElementChild.innerHTML = this.enabled.toString()
        }
    }

    enabledAttachObj.setEnabled()
    enabledAttachObj.btns.dontEnabledBtn.addEventListener('click', enabledAttachObj.setEnabled.bind(enabledAttachObj))

    const actionDeactivatedEvent = e => { console.log(e.detail.actions) }

    enabledAttachObj.btns.attachBtn.addEventListener('click', () => {
        controller.attach(window, enabledAttachObj.enabled)

        window.addEventListener(controller.ACTION_ACTIVATED, moveReducer)
        window.addEventListener(controller.ACTION_DEACTIVATED, actionDeactivatedEvent)
    })

    enabledAttachObj.btns.detachBtn.addEventListener('click', () => {
        controller.detach()

        window.removeEventListener(controller.ACTION_ACTIVATED, moveReducer)
        window.removeEventListener(controller.ACTION_DEACTIVATED, actionDeactivatedEvent)
    })


    // add action logic
    addActionsBtn.addEventListener('click', () => {
        const actions = mainActionArr.reduce((acc, action) => ({ ...acc, ...action[1].getControllerAction() }), {})
        controller.bindActions(actions)

    })
    addBounceBtn.addEventListener('click', () => {
        const actions = bounceActionArr.reduce((acc, action) => ({ ...acc, ...action[1].getControllerAction() }), {})
        controller.bindActions(actions)

    })

    // enable/disable actions
    const toggleEnableAction = (btn, actionName) => {
        const shouldAction = controller.actions[actionName]
        if (!shouldAction) return

        shouldAction.enabled ?
            controller.disableAction(actionName)
            :
            controller.enableAction(actionName)

        actionsObject[actionName] ?
            actionsObject[actionName].setEnabled(shouldAction.enabled)
            :
            bounceActionObject[actionName].setEnabled(shouldAction.enabled)

    }

    allActionsArr.forEach(action => {
        const { enabled, $btn, name } = action[1]

        action[1].setEnabled(enabled)
        $btn.addEventListener('click', () => toggleEnableAction($btn, name))
    })

    // Testing
    // const updateAction = () => {
    //     console.log('Идет ли экшн up:', controller.isActionActive('up'))
    //     requestAnimationFrame(updateAction)
    // }; updateAction()
}

controllerLogic()
