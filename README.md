# soft-engg-project-sep-2025-se-SEP-team_6

Industry: HRMS


Git clone the repo 
1. npm install tailwindcss @tailwindcss/vite
2. In the viteconfig.js, pasted the below code 
    import { defineConfig } from 'vite'
    import tailwindcss from '@tailwindcss/vite'

    export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    })

3. In the index.css file added the css import

## Working in Docker

1. Install the docker desktop -> https://docs.docker.com/desktop
2. Start the docker engine
3. Run the startup.sh on a bash terminal in vs code
4. The app is live on localhost:5173 ( Docker will run in detached mode )
5. In case you want to kill the docker containers -> run docker-compose down on your terminal.
