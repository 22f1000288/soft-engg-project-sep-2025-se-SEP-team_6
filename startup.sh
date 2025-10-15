docker compose down --volumes --rmi all
docker-compose up -d --build

rv=$?

if [ $rv -ne 0 ]; then
    echo "Docker Services Failed to start"
else
    echo "Docker Services Started Frontend http://localhost:5173 \n Backend http://localhost:8000/docs"
fi
