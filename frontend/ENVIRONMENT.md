## Debug Configuration

| Variable            | Description                                  | Required | Default |
| ------------------- | -------------------------------------------- | -------- | ------- |
| `DEBUG`             | Enable debug logging with namespace patterns | No       | -       |
| `NEXT_PUBLIC_DEBUG` | Enable client-side debug logging             | No       | false   |

### Debug Configuration Examples

```bash
# Server-side debugging

# Enable all debug logs
DEBUG=mod:*

# Enable only API and database logs
DEBUG=mod:api,mod:db

# Client-side debugging (use with caution in production)
NEXT_PUBLIC_DEBUG=true

```
