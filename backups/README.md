# Backups

Espacio para snapshots locales del repositorio.

## Qué hay acá

Backups en formato **git bundle**: un único archivo que contiene **todo el
historial de git** (todas las ramas y commits). Es la forma canónica de
respaldar un repo git. Nombre: `money-command-v2_<fecha>.bundle`.

> Los artefactos (`*.bundle`) están **gitignored** a propósito (ver
> `.gitignore`): son pesados y no deben entrar al historial del repo. Solo se
> versiona esta carpeta y su documentación.

## Cómo crear un backup nuevo

```bash
git bundle create "backups/money-command-v2_$(date +%Y-%m-%d_%H%M%S).bundle" --all
```

## Cómo restaurar desde un backup

```bash
# Clona el repo completo desde el bundle a una carpeta nueva
git clone backups/money-command-v2_<fecha>.bundle repo-restaurado
cd repo-restaurado
git log --oneline    # verificás que está toda la historia
```

## Cómo verificar que un bundle está sano

```bash
git bundle verify backups/money-command-v2_<fecha>.bundle
```

## Nota importante

El **backup canónico y fuera de este equipo** es el remoto de GitHub
(`origin/main`). Estos bundles son un respaldo **local** adicional: si el disco
de esta máquina falla, los bundles locales se pierden con él. Para un respaldo
duradero, copiá el `.bundle` a otro lugar (nube, disco externo) o confiá en que
GitHub ya tiene todo lo que fue pusheado.
