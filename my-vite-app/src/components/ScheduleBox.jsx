const ScheduleBox = ({ schedule, onClick }) => {
    return (
      <div 
        className="card m-2" 
        style={{ width: '200px', cursor: 'pointer' }}
        onClick={() => onClick(schedule)}
      >
        <div className="card-body">
          <h5 className="card-title">{schedule.term} {schedule.year}</h5>
        </div>
      </div>
    );
  };