export const formatDate = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    })
}
