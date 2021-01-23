
//this undo/redo implementation will work even when not all edit operations are saved.
//for example, if we don't save individual letters

export class UndoStack {
  constructor(capacity, initialState, getInput, pushOutput) {
    this.cind = 0;
    this.undone = 0;
    this.canundo = 0;
    this.stack = new Array(capacity);
    this.stack[0] = initialState;
    
    this.getInput = getInput;
    this.pushOutput = pushOutput;
  }
  
  update_cind(x) {
    this.cind = (this.cind + x + this.stack.length)%this.stack.length; //since javascript modulo is idiotic
  }
  
  save() {
    let inpstr = this.getInput();
    if(inpstr === this.stack[this.cind]) return;
    
    this.update_cind(1);
    this.stack[this.cind] = inpstr;
    this.undone = 0;
    if(this.canundo < this.stack.length - 1) this.canundo++;
  }
  
  undo() {
    this.save(); 
    if(this.canundo === 0) return;
    
    this.update_cind(-1);
    this.undone++;
    this.canundo--;
    this.pushOutput(this.stack[this.cind]);
  }
  
  redo() {
    this.save();
    if(this.undone === 0) return;
    
    this.update_cind(1);
    this.undone--;
    this.canundo++;
    this.pushOutput(this.stack[this.cind]);
  }
}





