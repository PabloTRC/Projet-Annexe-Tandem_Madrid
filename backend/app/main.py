from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama 

#Lancement, bdd récupérée via travail de Keanu
app =FastAPI()
dictionnaire = set()

#Stockage des questions
@app.post("/api/seances/questions")
async def ajout(questions: list[str]):
    global dictionnaire
    for question in questions:
        dictionnaire.add(question)
    return {"message": f"{len(questions)} questions reçues."}

#On réduit le nombre de questions en raison de la similitude des 
@app.post("/api/seances/reduction")
async def reduction():
    global dictionnaire
    if not dictionnaire:
        raise HTTPException(status_code=400, detail="Liste de questions vide")
    
    #liste des questions + adresse à l'IA
    liste_txt= "\n".join(f"- {q}" for q in dictionnaire)
    prompt= f"""Tu es un assistant pédagogique. Voici une liste de questions posées par des élèves pendant un cours :
    {liste_txt}. Ta mission : Réduire le nombre de questions. Pour cela, tu repèreras les similitudes entre les questions qui attendent la même réponse. 
    Renvoie-moi uniquement la liste finale des questions reformulées de manière claire.
    """

    #demande à ollama
    try:
        reponse=await ollama.AsyncClient().chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
        return {"questions_reduites": reponse['message']['content']}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur avec le LLM : {str(e)}")









