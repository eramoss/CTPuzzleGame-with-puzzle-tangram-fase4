import Dude from "../sprites/Dude";

export default class CommandAction {
    
    action: string;
    condition: string;
    constructor(action: string, condition: string) {
        this.action = action;
        this.condition = condition;
    }
    isTurnMove(): boolean {
        return this.action == 'left' || this.action == 'right'
    }
    
    isCondition() {
        return this.action.startsWith('if');
    }

    isConditionValid(): boolean {
        return true;
    }
}
