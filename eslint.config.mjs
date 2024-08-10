import pluginJs from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",  
      globals: {
        ...globals.browser,    
        ...globals.node        
      }
    }
  },
  {
    languageOptions: {
      globals: globals.browser 
    }
  },
  pluginJs.configs.recommended,
];
