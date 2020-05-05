import { createMuiTheme } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";

const customTheme = createMuiTheme({
  mixins: {
      toolbar: {
          minHeight: 48
      }
  },
  palette: {
      primary: {
          main: blue[300]
      }
  },
  props: {
      MuiCheckbox: {
          color: "primary"
      },
      MuiList: {
          dense: true
      },
      MuiRadio: {
          color: "primary"
      },
      MuiSwitch: {
          color: "primary"
      },
      MuiTable: {
          size: "small"
      },
      MuiTextField: {
          variant: "outlined"
      }
  },
  typography: {
      fontSize: 12,
      button: {
          textTransform: "none"
      }
  }
});

export default customTheme
