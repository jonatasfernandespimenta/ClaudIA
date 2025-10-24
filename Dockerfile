FROM qdrant/qdrant:latest

# Expor a porta padrão do Qdrant
EXPOSE 6333 6334

# Volume para persistência dos dados
VOLUME ["/qdrant/storage"]

# Comando para iniciar o Qdrant
CMD ["./qdrant"]
