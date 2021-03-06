/* humanize.min.js - v1.8.2 */
"use strict";
var _typeof =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function (n) {
        return typeof n;
      }
    : function (n) {
        return n && "function" == typeof Symbol && n.constructor === Symbol
          ? "symbol"
          : typeof n;
      };
!(function (n, e) {
  "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports))
    ? (module.exports = e())
    : "function" == typeof define && define.amd
    ? define([], function () {
        return (n.Humanize = e());
      })
    : (n.Humanize = e());
})(this, function () {
  var n = [
      { name: "second", value: 1e3 },
      { name: "minute", value: 6e4 },
      { name: "hour", value: 36e5 },
      { name: "day", value: 864e5 },
      { name: "week", value: 6048e5 },
    ],
    e = {
      P: Math.pow(2, 50),
      T: Math.pow(2, 40),
      G: Math.pow(2, 30),
      M: Math.pow(2, 20),
    },
    t = function (n) {
      return "undefined" != typeof n && null !== n;
    },
    r = function (n) {
      return n !== n;
    },
    i = function (n) {
      return isFinite(n) && !r(parseFloat(n));
    },
    o = function (n) {
      var e = Object.prototype.toString.call(n);
      return "[object Array]" === e;
    },
    a = {
      intword: function (n, e) {
        var t =
          arguments.length <= 2 || void 0 === arguments[2] ? 2 : arguments[2];
        return a.compactInteger(n, t);
      },
      compactInteger: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1] ? 0 : arguments[1];
        e = Math.max(e, 0);
        var t = parseInt(n, 10),
          r = 0 > t ? "-" : "",
          i = Math.abs(t),
          o = String(i),
          a = o.length,
          u = [13, 10, 7, 4],
          l = ["T", "B", "M", "k"];
        if (1e3 > i) return "" + r + o;
        if (a > u[0] + 3) return t.toExponential(e).replace("e+", "x10^");
        for (var f = void 0, c = 0; c < u.length; c++) {
          var v = u[c];
          if (a >= v) {
            f = v;
            break;
          }
        }
        var s = a - f + 1,
          d = o.split(""),
          p = d.slice(0, s),
          h = d.slice(s, s + e + 1),
          g = p.join(""),
          m = h.join("");
        m.length < e && (m += "" + Array(e - m.length + 1).join("0"));
        var b = void 0;
        if (0 === e) b = "" + r + g + l[u.indexOf(f)];
        else {
          var y = Number(g + "." + m).toFixed(e);
          b = "" + r + y + l[u.indexOf(f)];
        }
        return b;
      },
      intComma: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1] ? 0 : arguments[1];
        return a.formatNumber(n, e);
      },
      intcomma: function () {
        return a.intComma.apply(a, arguments);
      },
      fileSize: function (n) {
        var t =
          arguments.length <= 1 || void 0 === arguments[1] ? 2 : arguments[1];
        for (var r in e)
          if (e.hasOwnProperty(r)) {
            var i = e[r];
            if (n >= i) return a.formatNumber(n / i, t, "") + " " + r + "B";
          }
        return n >= 1024
          ? a.formatNumber(n / 1024, 0) + " KB"
          : a.formatNumber(n, 0) + a.pluralize(n, " byte");
      },
      filesize: function () {
        return a.fileSize.apply(a, arguments);
      },
      formatNumber: function (n) {
        var e =
            arguments.length <= 1 || void 0 === arguments[1] ? 0 : arguments[1],
          t =
            arguments.length <= 2 || void 0 === arguments[2]
              ? ","
              : arguments[2],
          r =
            arguments.length <= 3 || void 0 === arguments[3]
              ? "."
              : arguments[3],
          i = function (n, e, t) {
            return t ? n.substr(0, t) + e : "";
          },
          o = function (n, e, t) {
            return n.substr(t).replace(/(\d{3})(?=\d)/g, "$1" + e);
          },
          u = function (n, e, t) {
            return t ? e + a.toFixed(Math.abs(n), t).split(".")[1] : "";
          },
          l = a.normalizePrecision(e),
          f = (0 > n && "-") || "",
          c = String(parseInt(a.toFixed(Math.abs(n || 0), l), 10)),
          v = c.length > 3 ? c.length % 3 : 0;
        return f + i(c, t, v) + o(c, t, v) + u(n, r, l);
      },
      toFixed: function (n, e) {
        e = t(e) ? e : a.normalizePrecision(e, 0);
        var r = Math.pow(10, e);
        return (Math.round(n * r) / r).toFixed(e);
      },
      normalizePrecision: function (n, e) {
        return (n = Math.round(Math.abs(n))), r(n) ? e : n;
      },
      ordinal: function (n) {
        var e = parseInt(n, 10);
        if (0 === e) return n;
        var t = e % 100;
        if ([11, 12, 13].indexOf(t) >= 0) return e + "th";
        var r = e % 10,
          i = void 0;
        switch (r) {
          case 1:
            i = "st";
            break;
          case 2:
            i = "nd";
            break;
          case 3:
            i = "rd";
            break;
          default:
            i = "th";
        }
        return "" + e + i;
      },
      times: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1] ? {} : arguments[1];
        if (i(n) && n >= 0) {
          var r = parseFloat(n),
            o = ["never", "once", "twice"];
          if (t(e[r])) return String(e[r]);
          var a = t(o[r]) && o[r].toString();
          return a || r.toString() + " times";
        }
        return null;
      },
      pluralize: function (n, e, r) {
        return t(n) && t(e)
          ? ((r = t(r) ? r : e + "s"), 1 === parseInt(n, 10) ? e : r)
          : null;
      },
      truncate: function (n) {
        var e =
            arguments.length <= 1 || void 0 === arguments[1]
              ? 100
              : arguments[1],
          t =
            arguments.length <= 2 || void 0 === arguments[2]
              ? "..."
              : arguments[2];
        return n.length > e ? n.substring(0, e - t.length) + t : n;
      },
      truncateWords: function (n, e) {
        for (var r = n.split(" "), i = "", o = 0; e > o; )
          t(r[o]) && (i += r[o] + " "), o++;
        return r.length > e ? i + "..." : null;
      },
      truncatewords: function () {
        return a.truncateWords.apply(a, arguments);
      },
      boundedNumber: function (n) {
        var e =
            arguments.length <= 1 || void 0 === arguments[1]
              ? 100
              : arguments[1],
          t =
            arguments.length <= 2 || void 0 === arguments[2]
              ? "+"
              : arguments[2],
          r = void 0;
        return i(n) && i(e) && n > e && (r = e + t), (r || n).toString();
      },
      truncatenumber: function () {
        return a.boundedNumber.apply(a, arguments);
      },
      oxford: function (n, e, r) {
        var i = n.length,
          o = void 0;
        if (2 > i) return String(n);
        if (2 === i) return n.join(" and ");
        if (t(e) && i > e) {
          var u = i - e;
          (o = e),
            (r = t(r) ? r : ", and " + u + " " + a.pluralize(u, "other"));
        } else (o = -1), (r = ", and " + n[i - 1]);
        return n.slice(0, o).join(", ") + r;
      },
      dictionary: function (n) {
        var e =
            arguments.length <= 1 || void 0 === arguments[1]
              ? " is "
              : arguments[1],
          r =
            arguments.length <= 2 || void 0 === arguments[2]
              ? ", "
              : arguments[2],
          i = "";
        if (
          t(n) &&
          "object" === ("undefined" == typeof n ? "undefined" : _typeof(n)) &&
          !o(n)
        ) {
          var a = [];
          for (var u in n)
            if (n.hasOwnProperty(u)) {
              var l = n[u];
              a.push("" + u + e + l);
            }
          return a.join(r);
        }
        return i;
      },
      frequency: function (n, e) {
        if (!o(n)) return null;
        var t = n.length,
          r = a.times(t);
        return 0 === t ? r + " " + e : e + " " + r;
      },
      pace: function (e, t) {
        var r =
          arguments.length <= 2 || void 0 === arguments[2]
            ? "time"
            : arguments[2];
        if (0 === e || 0 === t) return "No " + a.pluralize(0, r);
        for (
          var i = "Approximately", o = void 0, u = void 0, l = e / t, f = 0;
          f < n.length;
          ++f
        ) {
          var c = n[f];
          if (((u = l * c.value), u > 1)) {
            o = c.name;
            break;
          }
        }
        o || ((i = "Less than"), (u = 1), (o = n[n.length - 1].name));
        var v = Math.round(u);
        return (r = a.pluralize(v, r)), i + " " + v + " " + r + " per " + o;
      },
      nl2br: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1]
            ? "<br/>"
            : arguments[1];
        return n.replace(/\n/g, e);
      },
      br2nl: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1]
            ? "\r\n"
            : arguments[1];
        return n.replace(/\<br\s*\/?\>/g, e);
      },
      capitalize: function (n) {
        var e =
          arguments.length <= 1 || void 0 === arguments[1] ? !1 : arguments[1];
        return (
          "" +
          n.charAt(0).toUpperCase() +
          (e ? n.slice(1).toLowerCase() : n.slice(1))
        );
      },
      capitalizeAll: function (n) {
        return n.replace(/(?:^|\s)\S/g, function (n) {
          return n.toUpperCase();
        });
      },
      titleCase: function (n) {
        var e =
            /\b(a|an|and|at|but|by|de|en|for|if|in|of|on|or|the|to|via|vs?\.?)\b/i,
          t = /\S+[A-Z]+\S*/,
          r = /\s+/,
          i = /-/,
          o = void 0;
        return (o = function (n) {
          for (
            var u =
                arguments.length <= 1 || void 0 === arguments[1]
                  ? !1
                  : arguments[1],
              l =
                arguments.length <= 2 || void 0 === arguments[2]
                  ? !0
                  : arguments[2],
              f = [],
              c = n.split(u ? i : r),
              v = 0;
            v < c.length;
            ++v
          ) {
            var s = c[v];
            -1 === s.indexOf("-")
              ? !l || (0 !== v && v !== c.length - 1)
                ? t.test(s)
                  ? f.push(s)
                  : e.test(s)
                  ? f.push(s.toLowerCase())
                  : f.push(a.capitalize(s))
                : f.push(t.test(s) ? s : a.capitalize(s))
              : f.push(o(s, !0, 0 === v || v === c.length - 1));
          }
          return f.join(u ? "-" : " ");
        })(n);
      },
      titlecase: function () {
        return a.titleCase.apply(a, arguments);
      },
    };
  return a;
});
