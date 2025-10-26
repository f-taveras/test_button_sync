// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'dtools-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/debug') {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                apiKey: env.VITE_DTOOLS_API_KEY ? 'Set' : 'Not set',
                nodeEnv: env.NODE_ENV,
                cwd: process.cwd()
              }))
              return
            }

            if (req.url === '/api/sync-dtools') {
              try {
                const apiKey = env.VITE_DTOOLS_API_KEY
                
                if (!apiKey) {
                  throw new Error('D-Tools API key not configured')
                }

                const url = 'https://api.d-tools.com/SI/Subscribe/Projects?id=6a212c7d-c5fc-4951-91f1-b762a99d8502&aggregateBy=false&getAdjustmentsByItem=true'

                console.log('📡 Fetching data from D-Tools API...')
                
                const { default: fetch } = await import('node-fetch')
                const response = await fetch(url, {
                  headers: {
                    'X-DTSI-ApiKey': apiKey,
                    'Accept': 'application/json'
                  }
                })

                if (!response.ok) {
                  throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                console.log('✅ Raw API data received')

                const dataDir = path.resolve(__dirname, 'src/data')
                
                // Ensure data directory exists
                if (!fs.existsSync(dataDir)) {
                  fs.mkdirSync(dataDir, { recursive: true })
                }

                // 1. Save raw JSON first (same as your original script)
                fs.writeFileSync(
                  path.join(dataDir, 'project-details.json'), 
                  JSON.stringify(data, null, 2), 
                  'utf-8'
                )
                console.log('💾 Saved project-details.json')

                // 2. Transform into nested packages with items (EXCLUDE add-on packages)
                // This matches your transform-dtools.js logic exactly
                const packages = data.Packages
                  .filter(pkg => !pkg.Name.toLowerCase().includes("add-on")) // Excludes add-ons
                  .map(pkg => ({
                    PackageId: pkg.Id,
                    PackageName: pkg.Name,
                    Description: pkg.Description || null,
                    Items: data.Items.filter(item => item.PackageId === pkg.Id).map(item => ({
                      Manufacturer: item.Manufacturer || null,
                      Model: item.Model || null,
                      Description: item.Description || null,
                      Quantity: item.Quantity ?? null,
                      UnitCost: item.UnitCost ?? null,
                      UnitPrice: item.UnitPrice ?? null
                    }))
                  }))

                // Save packages-nested.json (same as your original output)
                fs.writeFileSync(
                  path.join(dataDir, 'packages-nested.json'), 
                  JSON.stringify(packages, null, 2), 
                  'utf-8'
                )
                console.log('💾 Saved packages-nested.json')

                // 3. Also extract add-ons separately (if needed)
                const addons = data.Packages
                  .filter(pkg => pkg.Name.toLowerCase().includes("add-on"))
                  .map(pkg => ({
                    PackageId: pkg.Id,
                    PackageName: pkg.Name,
                    Description: pkg.Description || null,
                    Items: data.Items.filter(item => item.PackageId === pkg.Id).map(item => ({
                      Manufacturer: item.Manufacturer || null,
                      Model: item.Model || null,
                      Description: item.Description || null,
                      Quantity: item.Quantity ?? null,
                      UnitCost: item.UnitCost ?? null,
                      UnitPrice: item.UnitPrice ?? null
                    }))
                  }))

                fs.writeFileSync(
                  path.join(dataDir, 'AddOns.json'), 
                  JSON.stringify(addons, null, 2), 
                  'utf-8'
                )
                console.log('💾 Saved AddOns.json')

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ 
                  message: '✅ All files saved successfully!',
                  files: [
                    'project-details.json',
                    'packages-nested.json', 
                    'AddOns.json'
                  ],
                  stats: {
                    packages: packages.length,
                    addons: addons.length,
                    totalItems: packages.reduce((sum, pkg) => sum + pkg.Items.length, 0) + 
                               addons.reduce((sum, addon) => sum + addon.Items.length, 0)
                  }
                }))
                
              } catch (err) {
                console.error('❌ Sync error:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ 
                  error: err instanceof Error ? err.message : 'Unknown error occurred'
                }))
              }
            } else {
              next()
            }
          })
        }
      }
    ],
    server: {
      port: 5173
    }
  }
})