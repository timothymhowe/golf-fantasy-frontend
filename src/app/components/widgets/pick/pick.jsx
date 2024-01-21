import React from 'react';




const Pick = ({ hasMadePick, pick, onChangePick }) => {


    if (hasMadePick) {
        return (
            <div>
                <h2>Your Pick: {pick}</h2>
                <button className="subtle-button" onClick={onChangePick}>Change Pick</button>
            </div>
        );
    } else {
        return (
            <div>
                <h2>No Pick Yet</h2>
                <button className="big-button" onClick={onChangePick}>Pick Now!</button>
            </div>
        );
    }
};

export default Pick;
