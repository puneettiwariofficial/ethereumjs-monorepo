import test from 'tape'
import { ENR } from '../src/dns'
import testdata from './testdata.json'

const dns = testdata.dns

// Root DNS entries
test('ENR (root): should parse and verify and DNS root entry', (t) => {
  const subdomain = ENR.parseAndVerifyRoot(dns.enrRoot, dns.publicKey)
  t.equal(subdomain, 'JORXBYVVM7AEKETX5DGXW44EAY')
  t.end()
})

test('ENR (root): should error if DNS root entry is mis-prefixed', (t) => {
  try {
    ENR.parseAndVerifyRoot(dns.enrRootBadPrefix, dns.publicKey)
  } catch (e) {
    t.ok(e.toString().includes("ENR root entry must start with 'enrtree-root:'"))
    t.end()
  }
})

test('ENR (root): should error if DNS root entry signature is invalid', (t) => {
  try {
    ENR.parseAndVerifyRoot(dns.enrRootBadSig, dns.publicKey)
  } catch (e) {
    t.ok(e.toString().includes('Unable to verify ENR root signature'))
    t.end()
  }
})

test('ENR (root): should error if DNS root entry is malformed', (t) => {
  try {
    ENR.parseAndVerifyRoot(dns.enrRootMalformed, dns.publicKey)
  } catch (e) {
    t.ok(e.toString().includes("Could not parse 'l' value from ENR root entry"))
    t.end()
  }
})

// Tree DNS entries
test('ENR (tree): should parse a DNS tree entry', (t) => {
  const { publicKey, domain } = ENR.parseTree(dns.enrTree)

  t.equal(publicKey, 'AM5FCQLWIZX2QFPNJAP7VUERCCRNGRHWZG3YYHIUV7BVDQ5FDPRT2')
  t.equal(domain, 'nodes.example.org')
  t.end()
})

test('ENR (tree): should error if DNS tree entry is mis-prefixed', (t) => {
  try {
    ENR.parseTree(dns.enrTreeBadPrefix)
  } catch (e) {
    t.ok(e.toString().includes("ENR tree entry must start with 'enrtree:'"))
    t.end()
  }
})

test('ENR (tree): should error if DNS tree entry is misformatted', (t) => {
  try {
    ENR.parseTree(dns.enrTreeMalformed)
  } catch (e) {
    t.ok(e.toString().includes('Could not parse domain from ENR tree entry'))
    t.end()
  }
})

// Branch entries
test('ENR (branch): should parse and verify and DNS branch entry', (t) => {
  const expected = [
    'D2SNLTAGWNQ34NTQTPHNZDECFU',
    '67BLTJEU5R2D5S3B4QKJSBRFCY',
    'A2HDMZBB4JIU53VTEGC4TG6P4A',
  ]

  const branches = ENR.parseBranch(dns.enrBranch)
  t.deepEqual(branches, expected)
  t.end()
})

test('ENR (branch): should error if DNS branch entry is mis-prefixed', (t) => {
  try {
    ENR.parseBranch(dns.enrBranchBadPrefix)
  } catch (e) {
    t.ok(e.toString().includes("ENR branch entry must start with 'enrtree-branch:'"))
    t.end()
  }
})

// ENR DNS entries
test('ENR (enr): should convert an Ethereum Name Record string', (t) => {
  const { id, address, tcpPort, udpPort } = ENR.parseAndVerifyRecord(dns.enr)

  t.equal(id!.toString(), 'v4', 'Invalid id')
  t.equal(address, '40.113.111.135')
  t.equal(tcpPort, 30303)
  t.equal(udpPort, 30303)
  t.end()
})

test('ENR (enr): should return correct multiaddr conversion codes for ipv6', (t) => {
  const expected = { ipCode: 41, tcpCode: 6, udpCode: 273 }
  const protocolId = Buffer.from('v6')
  const codes = ENR._getIpProtocolConversionCodes(protocolId)

  t.deepEqual(codes, expected)
  t.end()
})

test('ENR (enr): should error if record mis-prefixed', (t) => {
  try {
    ENR.parseAndVerifyRecord(dns.enrBadPrefix)
  } catch (e) {
    t.ok(e.toString().includes("String encoded ENR must start with 'enr:'"))
    t.end()
  }
})

test('ENR (enr): should error when converting to unrecognized ip protocol id', (t) => {
  const protocolId = Buffer.from('v7')
  try {
    ENR._getIpProtocolConversionCodes(protocolId)
  } catch (e) {
    t.ok(e.toString().includes("IP protocol must be 'v4' or 'v6'"))
    t.end()
  }
})
