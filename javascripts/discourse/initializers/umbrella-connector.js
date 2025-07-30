import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.8", (api) => {

  const settings_base_url = settings.base_url;

  const UMBCONN = {
    load: function (target, base, path) {
      let url = base + path;

      const user = api.getCurrentUser();
      if (user) {
        // preserve your original URL strategy
        url = url + "/u" + user.username;
        url = url + "/g" + user.primary_group_name;
      }

      // Note: jQuery is available in themes; keep your original $.ajax flow
      $.ajax({
        method: "GET",
        url,
        dataType: "text",
        async: false,
        success: function (data) {
          if (data.includes("data-umbconn-onclick")) {
            // same behavior: clear placeholder, append server-provided HTML
            $(target).html("");
            $(target).append(data);

            // wire up delegated clicks that re-call the connector
            $(target)
              .find("a")
              .each(function () {
                if ($(this).data("umbconn-onclick")) {
                  $(this).on("click", function () {
                    const t = $("div[data-umbconn]");
                    UMBCONN.load(
                      t,
                      settings_base_url,
                      $(this).data("umbconn-onclick")
                    );
                  });
                }
              });
          } else {
            // replace the wrapper div with the returned HTML
            $(target).replaceWith(data);
          }
        },
      });
    },
  };

  // jQuery plugin wrapper (unchanged intent)
  $.fn.umbconn = function () {
    this.each(function () {
      UMBCONN.load(this, settings_base_url, $(this).data("umbconn"));
    });
    return this;
  };

  // run after cooked content renders (same hook name/id)
  api.decorateCooked(($elem) => {
    const $targets = $elem.find("div[data-umbconn]");
    if ($targets.length) {
        $targets.umbconn();
    }
  }, { id: "umbconn" });

});
