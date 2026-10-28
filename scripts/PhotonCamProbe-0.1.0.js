/* PhotonCamProbe 0.1.0 — request/response observation only. */
(function () {
  "use strict";
  var VERSION = "0.1.0";
  var HOST = "xikvdkhbxdfeglvecqda.supabase.co";
  var KEY = "OnyxNexus.PhotonCamProbe.0.1.0";
  var prefix = "[PhotonCamProbe " + VERSION + "] ";
  function log(s) { console.log(prefix + s); }
  function read() {
    try { return JSON.parse($prefs.valueForKey(KEY)) || {request:0,response:0,events:[]}; }
    catch (_) { return {request:0,response:0,events:[]}; }
  }
  function record(event, phase) {
    try {
      var state = read();
      state[phase] = (Number(state[phase]) || 0) + 1;
      state.events = (Array.isArray(state.events) ? state.events : []).slice(-11);
      state.events.push(new Date().toISOString() + " " + event);
      $prefs.setValueForKey(JSON.stringify(state), KEY);
    } catch (_) { log("statistics unavailable; traffic unchanged"); }
  }
  // Only known schema keys are printed. Unknown keys can themselves contain IDs.
  var allowed = ("id created_at enabled percentage percentage_decimal show_original_prize_over_percentage config depthML url fileSize version fileName data result error message status code isVip isVIP is_vip vip premium isPremium isPro is_pro pro expires_at expires_date expires_date_ms expiration_date entitlement entitlements subscription subscriptions subscriber product_id product_identifier purchase_date transaction signedTransactionInfo access_token refresh_token user session").split(" ");
  function schema(value, depth) {
    if (value === null) return "null";
    if (Array.isArray(value)) return {arrayLength:value.length, first:value.length ? schema(value[0],depth) : "empty"};
    if (typeof value !== "object") return typeof value;
    if (depth >= 4) return "object";
    var out = {}, keys = Object.keys(value), unknown = 0;
    keys.slice(0,80).forEach(function (k) {
      if (allowed.indexOf(k) < 0) { unknown++; return; }
      if (k === "config" && typeof value[k] === "string") {
        try { out[k] = schema(JSON.parse(value[k]),depth+1); }
        catch (_) { out[k] = "string"; }
      } else { out[k] = schema(value[k],depth+1); }
    });
    if (unknown) out.otherKeys = unknown;
    if (keys.length > 80) out.truncated = true;
    return out;
  }
  try {
    var url = String($request.url || "");
    if (/^http:\/\/example\.com(?::80)?\/photoncam-probe(?:\?|$)/.test(url)) {
      if (/[?&]reset=1(?:&|$)/.test(url)) $prefs.setValueForKey(JSON.stringify({request:0,response:0,events:[]}),KEY);
      var state = read();
      log("selftest OK; device membership unverified");
      $done({status:"HTTP/1.1 200 OK",headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"},body:
        "PhotonCamProbe " + VERSION + " 已加载\n诊断版，不修改会员或购买结果。\n请求命中：" + state.request + "\n响应命中：" + state.response + "\n\n最近记录（最多12条）：\n" + state.events.join("\n") + "\n\n零命中不代表没有网络；这里只观察指定的 PhotonCam 后台。"});
      return;
    }
    var match = /^https:\/\/([^\/:?#]+)(?::443)?(\/[^?#]*)?/.exec(url);
    if (!match || match[1].toLowerCase() !== HOST) { $done({}); return; }
    var path = match[2] || "/";
    var route = path === "/rest/v1/PhotonCamOnSale" ? "promotion-config" :
      path === "/rest/v1/PhotonCamConfig" ? "app-config" :
      path.indexOf("/rest/v1/") === 0 ? "other-rest-endpoint" :
      path.indexOf("/functions/v1/") === 0 ? "edge-function" :
      path.indexOf("/auth/v1/") === 0 ? "auth-endpoint" : "other-backend-endpoint";
    var phase = typeof $response === "undefined" ? "request" : "response";
    var message = phase + " route=" + route;
    if (phase === "response") {
      var status = String($response.statusCode || $response.status || "");
      var code = status.match(/\b[1-5][0-9]{2}\b/);
      message += " status=" + (code ? code[0] : "unknown");
      var body = typeof $response.body === "string" ? $response.body : "";
      if (body.length > 131072) { message += " schema=skipped-large-body"; }
      else if (body.length) {
        try { message += " schema=" + JSON.stringify(schema(JSON.parse(body),0)); }
        catch (_) { message += " schema=non-json-or-undecoded"; }
      } else { message += " schema=empty-or-unavailable"; }
    }
    message += "; unchanged; membership unverified";
    log(message);
    record(message,phase);
  } catch (_) { log("diagnostic error; traffic unchanged"); }
  $done({});
}());
