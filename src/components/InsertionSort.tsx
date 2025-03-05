import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Info, X } from 'lucide-react';

interface ArrayItem {
  value: number;
  status: 'unsorted' | 'sorting' | 'comparing' | 'sorted';
  position?: number; // Track original position
  elevation?: number; // For 3D effect when moving
}

const InsertionSort: React.FC = () => {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // milliseconds
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [sortingHistory, setSortingHistory] = useState<ArrayItem[][]>([]);
  const [arraySize, setArraySize] = useState(10);
  const [showInfo, setShowInfo] = useState(false);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // Generate a new random array
  const generateArray = () => {
    const newArray: ArrayItem[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 100) + 1,
        status: 'unsorted',
        position: i,
        elevation: 0
      });
    }
    setArray(newArray);
    setSortingHistory([newArray]);
    setCurrentStep(0);
    setTotalSteps(0);
    setIterations(0);
  };

  // Reset the animation
  const resetAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentStep(0);
    setIterations(0);
    if (sortingHistory.length > 0) {
      setArray(JSON.parse(JSON.stringify(sortingHistory[0])));
    }
  };

  // Perform insertion sort and record each step
  const performInsertionSort = () => {
    const history: ArrayItem[][] = [];
    const arr = JSON.parse(JSON.stringify(array));
    
    // Initial state
    history.push(JSON.parse(JSON.stringify(arr)));
    
    let iterationCount = 0;
    
    for (let i = 1; i < arr.length; i++) {
      const key = { ...arr[i] };
      
      // Elevate the current element (picking up)
      arr[i] = { ...arr[i], status: 'sorting', elevation: 20 };
      history.push(JSON.parse(JSON.stringify(arr)));
      iterationCount++;
      
      let j = i - 1;
      
      while (j >= 0 && arr[j].value > key.value) {
        // Mark the comparing element
        arr[j] = { ...arr[j], status: 'comparing' };
        history.push(JSON.parse(JSON.stringify(arr)));
        
        // Shift element to the right
        arr[j + 1] = { ...arr[j], status: 'unsorted', elevation: 0 };
        arr[j] = { ...key, status: 'sorting', elevation: 20 }; // Keep key elevated and move left
        history.push(JSON.parse(JSON.stringify(arr)));
        
        j--;
        iterationCount++;
      }
      
      // Place the key in its correct position (putting down)
      arr[j + 1] = { ...key, status: 'unsorted', elevation: 0 };
      history.push(JSON.parse(JSON.stringify(arr)));
    }
    
    // Mark all elements as sorted at the end
    for (let i = 0; i < arr.length; i++) {
      arr[i] = { ...arr[i], status: 'sorted', elevation: 0 };
      history.push(JSON.parse(JSON.stringify(arr)));
    }
    
    setSortingHistory(history);
    setTotalSteps(history.length - 1);
    setIterations(iterationCount);
    return history;
  };

  // Start or pause the animation
  const toggleAnimation = () => {
    if (isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsRunning(false);
      isRunningRef.current = false;
    } else {
      setIsRunning(true);
      isRunningRef.current = true;
      
      if (sortingHistory.length <= 1) {
        const history = performInsertionSort();
        if (history.length > 1) {
          animateSort(1);
        }
      } else {
        animateSort(currentStep + 1);
      }
    }
  };

  // Step forward in the animation
  const stepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setArray(JSON.parse(JSON.stringify(sortingHistory[currentStep + 1])));
    }
  };

  // Step backward in the animation
  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setArray(JSON.parse(JSON.stringify(sortingHistory[currentStep - 1])));
    }
  };

  // Animate the sorting process
  const animateSort = (step: number) => {
    if (step <= totalSteps && isRunningRef.current) {
      setCurrentStep(step);
      setArray(JSON.parse(JSON.stringify(sortingHistory[step])));
      
      setTimeout(() => {
        if (isRunningRef.current) {
          animationRef.current = requestAnimationFrame(() => animateSort(step + 1));
        }
      }, speed);
    } else {
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  // Toggle info modal
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Update isRunningRef when isRunning changes
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Initialize with a random array
  useEffect(() => {
    generateArray();
  }, [arraySize]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Insertion Sort Visualization</h1>
      
      <div className="w-full mb-8">
        <div className="flex justify-center items-end h-80 bg-gray-50 rounded-lg p-4 mb-8 relative">
          {array.map((item, index) => {
            // Determine color based on status
            let bgColor = 'bg-gray-400'; // unsorted
            let borderColor = 'border-gray-500';
            let shadowSize = 'shadow-md';
            
            if (item.status === 'sorting') {
              bgColor = 'bg-yellow-500';
              borderColor = 'border-yellow-600';
              shadowSize = 'shadow-xl';
            } else if (item.status === 'comparing') {
              bgColor = 'bg-red-500';
              borderColor = 'border-red-600';
              shadowSize = 'shadow-lg';
            } else if (item.status === 'sorted') {
              bgColor = 'bg-green-500';
              borderColor = 'border-green-600';
            }
            
            // Calculate elevation for 3D effect
            const elevation = item.elevation || 0;
            
            return (
              <div
                key={index}
                className={`relative mx-1 ${shadowSize} border-2 ${borderColor} rounded-md ${bgColor} transition-all duration-300`}
                style={{
                  width: `${90 / arraySize}%`,
                  minWidth: '30px',
                  height: '60px',
                  transform: `translateY(${-elevation}px)`,
                  zIndex: elevation > 0 ? 10 : 1
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {item.value}
                  </span>
                </div>
                <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                  {index}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mb-4 mt-6">
          <div className="text-sm text-gray-600">
            Step: {currentStep} / {totalSteps}
          </div>
          <div className="text-sm text-gray-600">
            Iterations: {iterations}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={stepBackward}
            disabled={currentStep === 0 || isRunning}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={toggleAnimation}
            className={`p-2 rounded-full ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={resetAnimation}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={stepForward}
            disabled={currentStep === totalSteps || isRunning}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
          
          <button
            onClick={toggleInfo}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            aria-label="Show algorithm information"
          >
            <Info size={20} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
              Animation Speed: {Math.round(1000 / speed)} steps/second
            </label>
            <input
              id="speed"
              type="range"
              min="100"
              max="1000"
              step="100"
              value={1000 - speed}
              onChange={(e) => setSpeed(1000 - parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              Array Size: {arraySize}
            </label>
            <input
              id="size"
              type="range"
              min="5"
              max="20"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <button
            onClick={generateArray}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            New Array
          </button>
        </div>
      </div>
      
      {/* Basic explanation always visible */}
      <div className="bg-gray-50 p-4 rounded-lg w-full">
        <h2 className="text-xl font-semibold mb-2 text-indigo-700">How Insertion Sort Works</h2>
        <p className="text-gray-700 mb-2">
          Insertion sort builds the final sorted array one item at a time. It's much like sorting playing cards in your hand:
        </p>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
          <li>Start with the second element (assume the first is already sorted)</li>
          <li>Pick up the current element (shown elevated in the animation)</li>
          <li>Compare with previous elements and shift larger elements to the right</li>
          <li>Place the current element in its correct position</li>
          <li>Repeat for all elements in the array</li>
        </ol>
        <div className="mt-4">
          <p className="text-gray-700">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="font-medium">Yellow</span>: Current element being inserted (elevated)
          </p>
          <p className="text-gray-700">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="font-medium">Red</span>: Element being compared
          </p>
          <p className="text-gray-700">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="font-medium">Green</span>: Sorted elements
          </p>
        </div>
      </div>
      
      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-indigo-700">Insertion Sort: Detailed Information</h2>
              <button 
                onClick={toggleInfo}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Algorithm Overview</h3>
              <p className="mb-4 text-gray-700">
                Insertion sort is a simple sorting algorithm that works similar to the way you sort playing cards in your hands. 
                The array is virtually split into a sorted and an unsorted part. Values from the unsorted part are picked and placed 
                at the correct position in the sorted part.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Time Complexity</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1 ml-4">
                <li><span className="font-medium">Best Case:</span> O(n) - When the array is already sorted</li>
                <li><span className="font-medium">Average Case:</span> O(n²) - When the array elements are in random order</li>
                <li><span className="font-medium">Worst Case:</span> O(n²) - When the array is sorted in reverse order</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Space Complexity</h3>
              <p className="mb-4 text-gray-700">
                O(1) - Insertion sort is an in-place sorting algorithm, meaning it requires constant extra space regardless of the input size.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Advantages</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1 ml-4">
                <li>Simple implementation</li>
                <li>Efficient for small data sets</li>
                <li>More efficient than other simple quadratic algorithms like Selection Sort or Bubble Sort</li>
                <li>Adaptive - performance improves if the data is partially sorted</li>
                <li>Stable - does not change the relative order of elements with equal keys</li>
                <li>In-place - only requires a constant amount O(1) of additional memory space</li>
                <li>Online - can sort a list as it receives it</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Disadvantages</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1 ml-4">
                <li>Inefficient for large data sets compared to advanced algorithms like Quick Sort, Merge Sort, or Heap Sort</li>
                <li>Quadratic time complexity makes it too slow for big input sizes</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Pseudocode</h3>
              <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
                <code className="text-sm">
{`insertionSort(array)
  for i = 1 to length(array) - 1
    key = array[i]
    j = i - 1
    
    // Move elements greater than key to one position ahead
    while j >= 0 and array[j] > key
      array[j + 1] = array[j]
      j = j - 1
    
    // Place key at its correct position
    array[j + 1] = key
  
  return array`}
                </code>
              </pre>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Real-world Applications</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1 ml-4">
                <li>Used in hybrid sorting algorithms like TimSort (used in Python) and IntroSort (used in C++ STL)</li>
                <li>Efficient for nearly-sorted data or small datasets</li>
                <li>Often used when the input array is small or nearly sorted</li>
                <li>Used in database systems for small datasets or as part of more complex algorithms</li>
                <li>Online sorting where items come one at a time and need to be placed in order immediately</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">Comparison with Other Algorithms</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 mb-4">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Algorithm</th>
                      <th className="py-2 px-4 border-b">Best Case</th>
                      <th className="py-2 px-4 border-b">Average Case</th>
                      <th className="py-2 px-4 border-b">Worst Case</th>
                      <th className="py-2 px-4 border-b">Space</th>
                      <th className="py-2 px-4 border-b">Stable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Insertion Sort</td>
                      <td className="py-2 px-4 border-b">O(n)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(1)</td>
                      <td className="py-2 px-4 border-b">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Bubble Sort</td>
                      <td className="py-2 px-4 border-b">O(n)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(1)</td>
                      <td className="py-2 px-4 border-b">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Selection Sort</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(1)</td>
                      <td className="py-2 px-4 border-b">No</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Merge Sort</td>
                      <td className="py-2 px-4 border-b">O(n log n)</td>
                      <td className="py-2 px-4 border-b">O(n log n)</td>
                      <td className="py-2 px-4 border-b">O(n log n)</td>
                      <td className="py-2 px-4 border-b">O(n)</td>
                      <td className="py-2 px-4 border-b">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Quick Sort</td>
                      <td className="py-2 px-4 border-b">O(n log n)</td>
                      <td className="py-2 px-4 border-b">O(n log n)</td>
                      <td className="py-2 px-4 border-b">O(n²)</td>
                      <td className="py-2 px-4 border-b">O(log n)</td>
                      <td className="py-2 px-4 border-b">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertionSort;