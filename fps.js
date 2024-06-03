// ==============================================================================================================
// fps.js
// ==============================================================================================================

export class FPS {
	constructor() {
		this._ticks = 0;
		this._fps = 60;
		this._startTime;
		this._nextSecond = window.performance.now () + 1000;
		this._frameCount = 0;
	}
	
	/// Called when the code that executes one game-loop is begun.
	
	startFrame () {
		this._startTime = window.performance.now ();
		return this._startTime;
	}
	
	/// Called when the code that executes one game-loop is complete. Returns the time in milliseconds 
	/// required for the one frame. This is not the same as FPS since the actual canvas rendering is 
	/// likely clamped to 1/60 second. This does allow you to observe the effect of changes to your code 
	/// on the time to *prepare* one frame.
	/// Note, endFrame() must be called once per game loop for FPS to be correct.
	
	endFrame () {
		var endTime = window.performance.now ();
		
		// Get time for one game loop, compute FPS.
		this._frameCount++;
		if (endTime > this._nextSecond) {
			this._nextSecond += 1000;
			this._fps = this._frameCount;
			this._frameCount = 0;
		}
		
		this._ticks = this._ticks + 1;
		
		return endTime - this._startTime;
	}
	
	/// Returns current frames-per-second.
	/// Note, endFrame() must be called once per game loop for FPS to be correct.
	
	fps () {
		return this._fps;
	}
};
