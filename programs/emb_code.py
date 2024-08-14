from transformers import LlamaForCausalLM, CodeLlamaTokenizer

tokenizer = CodeLlamaTokenizer.from_pretrained("meta-llama/CodeLlama-7b-hf")
model = LlamaForCausalLM.from_pretrained("meta-llama/CodeLlama-7b-hf")
