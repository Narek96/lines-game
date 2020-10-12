import { connect } from "react-redux";
import { emptyContent } from "../Constants";
import  Lines  from "../components/Lines"

const mapStateToProps = (state) => ({
  score: state.score || 0,
  content: state.content || emptyContent,
  chosen: {x: state.chosenX, y: state.chosenY}
});

export default  connect(mapStateToProps)(Lines)
