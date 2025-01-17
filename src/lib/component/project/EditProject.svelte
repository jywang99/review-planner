<script lang="ts">
  import { validateProject, type ProjectPartial } from "$lib/api";
  import { obtain } from "$lib/api.client";
  import { MAX_ITERATIONS } from "$lib/const";
  import { setLoadingState, setToastState } from "$lib/store/global.svelte";
  import { Table, Td, Th, Tr } from "../table";

  let { project: initProj, onSave, onCancel }: {
    project: ProjectPartial;
    onSave: (id: number) => void;
    onCancel: () => void;
  }= $props();

  let project = $state({ ...initProj });
  const isNew = !initProj.id;

  function handleOffsetDayChange(i: number, e: Event) {
    const target = e.target as HTMLInputElement;
    project.offsetDays[i] = parseInt(target.value);
  }

  async function save() {
    const err = validateProject(project);
    if (err) {
      alert(err);
      return;
    }

    setLoadingState(true);

    const resp = await obtain(undefined, {
      method: isNew ? "POST" : "PUT",
      body: JSON.stringify({ project }),
    });

    if (!resp.ok) {
      console.error("Failed to save", resp);
      setToastState({ type: "error", message: "Failed to save" });
      setTimeout(() => window.location.reload(), 500);
      return;
    }

    if (isNew) {
      const data = await resp.json();
      project.id = data.id;
    }

    setLoadingState(false);
    onSave(project.id!);
  }
</script>

<div class="container">
  <div class="inputs">
    <input class="title" type="text" value={project.name} oninput={e => project.name = (e.target as HTMLInputElement).value} />
    <br />
    <textarea value={project.description} oninput={e => project.description = (e.target as HTMLTextAreaElement).value}></textarea>
  </div>

  <h2>Iterations</h2>
  <p>Default offset days for new tasks.</p>

  <div class="striped">
    <Table>
      <thead>
        <Tr>
          <Th>Iteration</Th>
          <Th>+days</Th>
          <Th>Actions</Th>
        </Tr>
      </thead>
      <tbody>
        <Tr>
          <Td>1</Td>
          <Td>0</Td>
          <Td></Td>
        </Tr>
        {#each project.offsetDays as offsetDay, i}
          <Tr>
            <Td>{i + 2}</Td>
            <Td>
              <input type="number" name="offsetDays" value={offsetDay} 
                onfocusin={e => (e.target as HTMLInputElement).select()} 
                onchange={e => handleOffsetDayChange(i, e)} />
            </Td>
            <Td>
              <button type="button" onclick={() => project.offsetDays = project.offsetDays.filter((_, j) => j !== i)} aria-label="delete">
                <i class="fas fa-trash"></i>
              </button>
            </Td>
          </Tr>
        {/each}
        <tr>
          <td colspan="99">
            <button type="button" 
              onclick={() => project.offsetDays = [...project.offsetDays, project.offsetDays[project.offsetDays.length-1] * 2]}
              disabled={project.offsetDays.length >= MAX_ITERATIONS - 1}>
              Add iteration
            </button>
          </td>
        </tr>
      </tbody>
    </Table>
  </div>
  <br />

  <button onclick={save} aria-label="save">Save</button>
  <button onclick={() => { onCancel(); project = initProj; }} aria-label="cancel">Cancel</button>
</div>

<style>
  .container {
    padding-top: 1em;
  }

  .title {
    font-size: 1.5em;
    font-weight: bold;
  }

  .inputs input, textarea {
    margin-bottom: 1em;
    width: 100%;
  }

  textarea {
    height: 10em;
  }
</style>

