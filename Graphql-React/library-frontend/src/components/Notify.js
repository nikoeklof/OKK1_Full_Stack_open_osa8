const Notify = (props) => {
  if (props.errorMessage === null || props.errorMessage === undefined) {
    return <div></div>
  }
  return (
    <div
      style={{
        border: "5px solid red",
        color: "red",
        background: "#ffa1a1",
        padding: "5px",
        borderRadius: "10px",
      }}
    >
      {props.errorMessage}
    </div>
  )
}

export default Notify
