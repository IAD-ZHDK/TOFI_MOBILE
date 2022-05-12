// state machine based on https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
export function createMachine(stateMachineDefinition) {
    const FSM = {
        value: stateMachineDefinition.initialState,
        transition(currentState, event) {
            const currentStateDefinition = stateMachineDefinition[currentState]
            const destinationTransition = currentStateDefinition.transitions[event]
            if (!destinationTransition) {
                return
            }
            const destinationState = destinationTransition.target
            const destinationStateDefinition =
                stateMachineDefinition[destinationState]

            destinationTransition.action()
            currentStateDefinition.actions.onExit()
            destinationStateDefinition.actions.onEnter()

            FSM.value = destinationState

            return FSM.value
        },
    }
    return FSM
}
// export default Note