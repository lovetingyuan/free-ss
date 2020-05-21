export default function ([server, port, password, method]: [string, number, string, string]) {
  return {
    "server": server,
    "server_port": port,
    "password": password,
    "method": method,
    "remarks": "",
    "route": "all",
    "remote_dns": "dns.google",
    "ipv6": true,
    "metered": false,
    "proxy_apps": {
      "enabled": false
    },
    "udpdns": false
  }
}
