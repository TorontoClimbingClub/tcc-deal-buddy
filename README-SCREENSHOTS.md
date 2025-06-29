# Component Mapping for TCC Deal Buddy

This project uses a simplified UI editing approach with component mapping instead of screenshot automation.

## Current Approach

### Component Mapping System

The project uses automated component mapping for precise UI targeting:

```bash
# Generate component mapping
npm run ui:update-map

# Setup UI editing (if needed)
npm run ui:setup
```

### How It Works

1. **Component Discovery**: Automatically scans `src/components/` and `src/pages/`
2. **Mapping Generation**: Creates `CLAUDE_UI_MAP.md` with precise file:line locations
3. **Live Development**: Use existing dev server for immediate feedback
4. **Precise Targeting**: Edit components using exact file and line numbers

### Benefits

- **No Dependencies**: No Playwright, Sharp, or browser automation needed
- **Faster Workflow**: Instant component targeting and live preview
- **More Reliable**: No screenshot capture failures or compatibility issues
- **Lightweight**: Zero additional setup or maintenance overhead

## Usage

### Basic Workflow

```bash
# Start development server
npm run dev

# Generate/update component mapping
npm run ui:update-map

# Use CLAUDE_UI_MAP.md for precise component targeting
# Make edits using file:line locations
# Verify changes in browser with live reload
```

### Example Component Map Output

```markdown
#### ProductCard
**File:** `src/components/ProductCard.tsx`
**Lines:** 156

**Key Elements:**
- **Card** (line 25) - `card`
  - Context: `<Card className="product-card border rounded-lg">`
- **Button** (line 45) - `button`
  - Context: `<Button onClick={addToCart} className="add-to-cart-btn">`
```

## Migration from Screenshots

If you previously used screenshot-based workflows:

### Old System (No Longer Used):
- ~~Playwright installation~~
- ~~Screenshot capture and comparison~~
- ~~Complex browser automation setup~~
- ~~ui:before/after/compare commands~~

### New System (Current):
- Component mapping generation
- Live development feedback
- Direct file editing with precise targeting
- Simplified npm scripts

## File Structure

```
tcc-deal-buddy/
├── CLAUDE_UI_MAP.md              # Auto-generated component mapping
├── package.json                  # Contains ui:update-map script
├── src/
│   ├── components/               # Components scanned for mapping
│   ├── pages/                    # Pages scanned for mapping
│   └── ...
└── (dev server provides live preview)
```

## Integration with Claude Code

Claude Code can now:

1. **Generate component maps** using `npm run ui:update-map`
2. **Target components precisely** using file:line locations from the map
3. **Verify changes immediately** using the live dev server
4. **Maintain accuracy** without complex screenshot workflows

The component mapping provides:
- **Precise targeting**: Exact file and line locations
- **Component context**: Understanding of component structure
- **Live feedback**: Immediate preview through dev server
- **Framework integration**: Works seamlessly with React + Vite

## Troubleshooting

- **"Component map not found"**: Run `npm run ui:update-map` to generate
- **"Components not detected"**: Ensure `src/components/` directory exists
- **"Live preview not working"**: Verify dev server is running with `npm run dev`

## Advanced Usage

For complex UI modifications:

1. **Run component mapping**: `npm run ui:update-map`
2. **Review component hierarchy**: Check `CLAUDE_UI_MAP.md`
3. **Target specific components**: Use exact file:line locations
4. **Verify changes**: Use live dev server for immediate feedback
5. **Update mapping**: Re-run after major component changes

---

*This simplified approach eliminates screenshot complexity while maintaining the precision and reliability needed for effective UI development.*