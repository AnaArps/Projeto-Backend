import type { Request, Response } from "express";
import ProductRepository from "../repositories/ProductRepository.js";

// Validações básicas dos dados recebidos
function validateProduct(body: any): string | null {
    if (!body || typeof body != "object") {
        return "Dados do produto não informados.";
    }

    if (!body.categoryId || typeof body.categoryId != "string") {
        return "O campo categoryId é obrigatório.";
    }

    if (!body.name || typeof body.name != "string" || body.name.trim() === "") {
        return "O campo name é obrigatório.";
    }

    if (typeof body.price != "number" || body.price < 0) {
        return "O campo price é obrigatório e deve ser um número maior ou igual a zero.";
    }

    return null;
}

// Código de erro do PostgreSQL para violação de chave estrangeira
function isForeignKeyError(error: any) {
    return error?.code === "23503";
}

async function getAll(req: Request, res: Response) {
    try {
        const products = await ProductRepository.findAll();

        res.status(200).json(products)
    } catch (error) {
        console.log("Erro ao buscar produtos: ", error);

        res.status(500).json({
            message: "Erro ao buscar produtos."
        });
    }
}

async function getByKeyword(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword || typeof keyword != "string") {
        return res.status(400).json({
            message: "Palavra-chave não informada."
        });
    }

    try {
        const products = await ProductRepository.searchByKeyword(keyword);

        res.status(200).json(products);
    } catch (error) {
        console.log("Erro ao pesquisar produtos: ", error);

        res.status(500).json({
            message: "Erro ao pesquisar produtos.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do produto não informado."
        });
    }

    try {
        const product = await ProductRepository.findById(id);

        res.status(200).json(product)
    } catch (error) {
        console.log("Erro ao buscar produto: ", error);

        res.status(404).json({
            message: "Produto não encontrado."
        });
    }
}

async function create(req: Request, res: Response) {
    const validationError = validateProduct(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const product = await ProductRepository.create(req.body);

        res.status(201).json(product)
    } catch (error) {
        console.log("Erro ao criar produto: ", error);

        if (isForeignKeyError(error)) {
            return res.status(400).json({
                message: "A categoria informada não existe."
            });
        }

        res.status(500).json({
            message: "Erro ao criar produto."
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do produto não informado."
        });
    }

    const validationError = validateProduct(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const product = await ProductRepository.update(id, req.body);

        res.status(200).json(product)
    } catch (error) {
        console.log("Erro ao atualizar produto: ", error);

        if (isForeignKeyError(error)) {
            return res.status(400).json({
                message: "A categoria informada não existe."
            });
        }

        res.status(404).json({
            message: "Produto não encontrado."
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do produto não informado."
        });
    }

    try {
        await ProductRepository.remove(id);

        res.status(200).json({
            message: "Produto removido com sucesso."
        })
    } catch (error) {
        console.log("Erro ao excluir produto: ", error);

        res.status(404).json({
            message: "Produto não encontrado."
        });
    }
}

export default {
    getAll,
    getByKeyword,
    getById,
    create,
    update,
    remove
}