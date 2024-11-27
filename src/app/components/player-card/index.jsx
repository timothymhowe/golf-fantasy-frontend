import React from "react";
import ReactTooltip from "react-tooltip-latest";
import Image from "next/image";


// TODO: Low priority, fully implement this feature.
/**
 * Renders a golfer's name with a tooltip displaying additional information.
 * @param {Object} golfer - The golfer object containing name, info, image, and results.
 * @returns {JSX.Element} - The component JSX.
 */
const GolferNameWithTooltip = ({ golfer }) => {
  // TODO: Remove this placeholder data and replace it with the golfer prop
  // const golfer = {
  //   name: "John Doe",
  //   info: "John Doe is a professional golfer with numerous wins under his belt.",
  //   image: "/public/portrait_placeholder_75.png",
  //   results: [
  //     { tournament: "Tournament 1", result: "1st" },
  //     { tournament: "Tournament 2", result: "2nd" },
  //     { tournament: "Tournament 3", result: "3rd" },
  //     { tournament: "Tournament 4", result: "4th" },

  //     { tournament: "Tournament 5", result: "3rd" },
  //     // Add more results as needed
  //   ], 
  // };
  return (
    <div>
      <p data-tip data-for={golfer.name}>
        {golfer.name}
      </p>
      <ReactTooltip
        id={golfer.name}
        place="top"
        effect="solid"
        clickable={true}
      >
        <div className="flex">
          <Image
          width={100}
          height={100}
            src={golfer.image}
            alt={golfer.name}
            className="w-20 h-20 mr-4"
          />
          <div>
            <h1>{golfer.name}</h1>
            <p>{golfer.info}</p>
            <table className="mt-4">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {golfer.results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.tournament}</td>
                    <td>{result.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ReactTooltip>
    </div>
  );
};

export default GolferNameWithTooltip;
