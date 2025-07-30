01  import { apiInitializer } from "discourse/lib/api";
02  import { settings } from "discourse/lib/theme-settings";
03
04  export default apiInitializer("1.61.0", (api) => {
05    const settings_base_url = settings.base_url;
06
07    const UMBCONN = {
08      load: function (target, base, path) {
09        let url = base + path;
10
11        const user = api.getCurrentUser();
12        if (user) {
13          // preserve your original URL strategy
14          url = url + "/u" + user.username;
15          url = url + "/g" + user.primary_group_name;
16        }
17
18        // Note: jQuery is available in themes; keep your original $.ajax flow
19        $.ajax({
20          method: "GET",
21          url,
22          dataType: "text",
23          success: function (data) {
24            if (data.includes("data-umbconn-onclick")) {
25              // same behavior: clear placeholder, append server-provided HTML
26              $(target).html("");
27              $(target).append(data);
28
29              // wire up delegated clicks that re-call the connector
30              $(target)
31                .find("a")
32                .each(function () {
33                  if ($(this).data("umbconn-onclick")) {
34                    $(this).on("click", function () {
35                      const t = $("div[data-umbconn]");
36                      UMBCONN.load(
37                        t,
38                        settings_base_url,
39                        $(this).data("umbconn-onclick")
40                      );
41                    });
42                  }
43                });
44            } else {
45              // replace the wrapper div with the returned HTML
46              $(target).replaceWith(data);
47            }
48          },
49        });
50      },
51    };
52
53    // jQuery plugin wrapper (unchanged intent)
54    $.fn.umbconn = function () {
55      this.each(function () {
56        UMBCONN.load(this, settings_base_url, $(this).data("umbconn"));
57      });
58      return this;
59    };
60
61    // run after cooked content renders (same hook name/id)
62    api.decorateCooked(
63      ($elem) => $elem.children(".cooked div[data-umbconn]").umbconn(),
64      { id: "umbconn" }
65    );
66  });
