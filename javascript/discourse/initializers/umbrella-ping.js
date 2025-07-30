import { apiInitializer } from "discourse/lib/api";
export default apiInitializer("0.8", () => {
  console.log("[umbconn] ping: initializer file loaded");
});
