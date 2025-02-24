import { Seat } from "../types/seats.type";

interface SeatsGridProps {
  gridDimensions: {
    capacity: number;
    rows: number;
    cols: number;
  };
  seats: boolean[][];
  seatsSold?: Seat[];
  isEditing?: boolean;
  activeSeats: Seat[];
  isSelling?: boolean;
  seatsInCart?: Seat[];
  onSeatToggle: (row: number, col: number, isSelected: boolean, isSold: boolean, isInCart: boolean) => void;
}

export const SeatsGrid = ({
  gridDimensions,
  seats,
  activeSeats: selectedSeats,
  isEditing = false,
  isSelling = false,
  seatsSold = [],
  seatsInCart = [],
  onSeatToggle,
}: SeatsGridProps) => {
  const isSeatSelected = (row: number, col: number) => {
    return selectedSeats.some(seat => seat.row === row && seat.number === col);
  };

  const isSeatSold = (row: number, col: number) => {
    return seatsSold.some(seat => seat.row === row && seat.number === col);
  };
  const isSeatInCart = (row: number, col: number) => {
    return seatsInCart.some(seat => seat.row === row && seat.number === col);
  };

  return (
    <div className={`grid w-auto bg-gray-200 p-4 rounded`}
      style={{
        gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))`
      }}>
      {seats.map((row, i) => {
        const startPadding = i === seats.length - 1
          ? Math.floor((gridDimensions.cols - (gridDimensions.capacity % gridDimensions.cols || gridDimensions.cols)) / 2)
          : 0;
        return row.map((_, j) => {
          const seatNumber = i * gridDimensions.cols + j;
          const isValidSeat = seatNumber < gridDimensions.capacity;
          const shouldShow = isValidSeat && (i !== seats.length - 1 || (j >= startPadding && j < startPadding + (gridDimensions.capacity % gridDimensions.cols || gridDimensions.cols)));
          const isSelected = isSeatSelected(i, j);
          const isSold = isSeatSold(i, j);
          const isInCart = isSeatInCart(i, j);
          return (
            <div
              key={`${i}-${j}`}
              onClick={() => (isEditing || isSelling) && shouldShow && onSeatToggle(i, j, isSelected, isSold, isInCart)}
              className={`
                w-6 h-8 border-2 rounded transition-colors
                ${!shouldShow ? 'invisible' : 'cursor-pointer'}
                ${isInCart && shouldShow
                  ? 'bg-green-500 border-green-600'
                  : isSold && shouldShow
                  ? 'bg-red-500 border-red-600'
                  : isSelected && shouldShow
                  ? 'bg-blue-500 border-blue-600'
                  : 'bg-gray-100 border-gray-300'
                }
                ${(isEditing || isSelling) && shouldShow ? 'hover:bg-blue-200' : ''}
              `}
            />
          );
        });
      })}
      <br />
      <br />
      <div className="col-span-full text-center mt-4 p-2 bg-gray-800 text-white rounded">
        Pantalla
      </div>
    </div>
  );
};