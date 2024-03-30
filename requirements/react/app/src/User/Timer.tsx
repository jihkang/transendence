import { useEffect, useState } from "react";

interface Props {
  time: number;
  setTime: (arg1: number) => void;
}

const getSeconds = (time: number) => {
  const seconds = time;
  if (seconds <= 0) {
    return "X";
  }
  if (seconds < 10) {
    return "0" + String(seconds);
  } else {
    return String(seconds);
  }
};

const Timer = (props: Props) => {
  useEffect(() => {
    const timer = setInterval(() => {
      props.setTime(props.time - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [props.time]);
  return (
    <div>
      <h1>남은 시간 : {getSeconds(props.time)}</h1>
    </div>
  );
};

export default Timer;
